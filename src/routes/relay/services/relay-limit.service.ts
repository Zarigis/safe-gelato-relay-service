import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerStorageService } from '@nestjs/throttler';
import { ethers } from 'ethers';

@Injectable()
export class RelayLimitService {
  // Time to limit in seconds
  private readonly ttl: number;

  // Number of relay requests per ttl
  private readonly limit: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly throttlerStorageService: ThrottlerStorageService,
  ) {
    this.ttl = this.configService.getOrThrow<number>('relay.ttl');
    this.limit = this.configService.getOrThrow<number>('relay.limit');
  }

  /**
   * Generate key for caching number of relays
   */
  private generateKey(chainId: string, address: string) {
    return `${chainId}:${ethers.getAddress(address)}`;
  }

  /**
   * Get the current relay limit for an address
   */
  public getRelayLimit(
    chainId: string,
    address: string,
  ): {
    limit: number;
    remaining: number;
    expiresAt?: number;
  } {
    const key = this.generateKey(chainId, address);
    const throttlerEntry = this.throttlerStorageService.storage[key] || {
      totalHits: 0,
    };

    return {
      limit: this.limit,
      remaining: Math.max(0, this.limit - throttlerEntry.totalHits),
      expiresAt: throttlerEntry.expiresAt,
    };
  }

  /**
   * Check if addresses can relay
   */
  public canRelay(chainId: string, addresses: string[]): boolean {
    return addresses.every((address) => {
      const limit = this.getRelayLimit(chainId, address);
      return limit.remaining > 0;
    });
  }

  /**
   * Increment the number of relays for addresses
   */
  public async increment(chainId: string, addresses: string[]): Promise<void> {
    await Promise.all(
      addresses.map((address) => {
        const key = this.generateKey(chainId, address);
        return this.throttlerStorageService.increment(key, this.ttl);
      }),
    );
  }
}

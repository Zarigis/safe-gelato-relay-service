import { GelatoRelay, RelayResponse } from '@gelatonetwork/relay-sdk';
import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common/decorators';
import { ConfigService } from '@nestjs/config';

import { SponsoredCallDto } from '../../routes/relay/entities/sponsored-call.entity';
import { ISponsorService } from './sponsor.service.interface';

@Injectable()
export class GelatoSponsorService implements ISponsorService {
  constructor(
    private readonly configService: ConfigService,
    @Inject('GelatoRelay') private readonly relayer: GelatoRelay,
  ) {}

  /**
   * If you are using your own custom gas limit, please add a 150k gas buffer on top of the expected
   * gas usage for the transaction. This is for the Gelato Relay execution overhead, and adding this
   * buffer reduces your chance of the task cancelling before it is executed on-chain.
   * @see https://docs.gelato.network/developer-services/relay/quick-start/optional-parameters
   */
  private static GAS_LIMIT_BUFFER = BigInt(150_000);
  private getRelayGasLimit(gasLimit: bigint): bigint {
    return gasLimit + GelatoSponsorService.GAS_LIMIT_BUFFER;
  }

  /**
   * Relays transaction data via Gelato's `sponsoredCall`
   */
  async sponsoredCall(
    sponsoredCallDto: SponsoredCallDto,
  ): Promise<RelayResponse> {
    const { chainId, safeAddr, data } = sponsoredCallDto;

    const relayContract = this.configService.getOrThrow(
      `relayContract.${chainId}`,
    );
    const feeToken = this.configService.getOrThrow(`feeToken.${chainId}`);
    const authAddr = this.configService.getOrThrow(`authAddr.${chainId}`);

    /*
    const gasLimit = sponsoredCallDto.gasLimit
      ? this.getRelayGasLimit(sponsoredCallDto.gasLimit).toString()
      : undefined;
    */

    const request = {
      chainId: chainId,
      target: relayContract,
      data: data,
      feeToken: feeToken,
      isRelayContext: true,
    };

    if (safeAddr.toLowerCase() == authAddr.toLowerCase()) {
      const apiKey = this.configService.getOrThrow(`gelato.apiKey.${chainId}`);
      const dummyRelay = this.configService.getOrThrow(`dummyRelay.${chainId}`);
      return this.relayer.sponsoredCall(
        { chainId: chainId, target: dummyRelay, data: data },
        apiKey,
      );
    }

    return this.relayer.callWithSyncFee(request);
  }
}

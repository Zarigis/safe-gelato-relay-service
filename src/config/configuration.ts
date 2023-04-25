import { SupportedChainId } from './constants';

export default () => ({
  about: {
    name: 'safe-gelato-relay-service',
  },
  relayContract: {
    [SupportedChainId.POLYGON]: process.env.POLYGON_RELAY_CONTRACT,
  },
  feeToken: {
    [SupportedChainId.POLYGON]: process.env.POLYGON_FEE_TOKEN,
  },
  authAddr: {
    [SupportedChainId.POLYGON]: process.env.POLYGON_AUTH_ADDR,
  },
  dummyRelay: {
    [SupportedChainId.POLYGON]: process.env.POLYGON_DUMMY_RELAY,
  },
  applicationPort: process.env.APPLICATION_PORT || '3000',
  relay: {
    ttl: process.env.THROTTLE_TTL || 60, // 1 minute
    limit: process.env.THROTTLE_LIMIT || 5,
  },
  gelato: {
    apiKey: {
      [SupportedChainId.GOERLI]: process.env.GELATO_GOERLI_API_KEY,
      [SupportedChainId.GNOSIS_CHAIN]: process.env.GELATO_GNOSIS_CHAIN_API_KEY,
      [SupportedChainId.POLYGON]: process.env.GELATO_POLYGON_API_KEY,
    },
  },
  gatewayUrl: process.env.GATEWAY_URL || 'https://safe-client.safe.global',
});

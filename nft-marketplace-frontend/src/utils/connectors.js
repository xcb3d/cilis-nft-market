import { InjectedConnector } from '@web3-react/injected-connector';
import { SUPPORTED_CHAINS } from './constants';

export const injected = new InjectedConnector({
  supportedChainIds: Object.values(SUPPORTED_CHAINS),
});

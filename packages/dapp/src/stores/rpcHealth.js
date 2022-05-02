import { chainUrls } from 'lib/constants';
import { logDebug, logError } from 'lib/helpers';
import { getValidEthersProvider } from 'lib/providerHelpers';

const { REACT_APP_RPC_HEALTH_UPDATE_INTERVAL } = process.env;

const DEFAULT_RPC_HEALTH_UPDATE_INTERVAL = 60000;

const UPDATE_INTERVAL =
  REACT_APP_RPC_HEALTH_UPDATE_INTERVAL || DEFAULT_RPC_HEALTH_UPDATE_INTERVAL;

class RPCHealthStore {
  rpcHealth = {};

  constructor() {
    setTimeout(() => this.updateRPCHealth(), 5000);
  }

  async updateRPCHealth() {
    await Promise.all(
      Object.entries(chainUrls).map(async ([chainId, { name }]) => {
        try {
          const provider = await getValidEthersProvider(chainId);
          this.rpcHealth[chainId] = provider
            ? await provider.getBlockNumber()
            : false;
        } catch (error) {
          this.rpcHealth[chainId] = false;
          logError(`${name} RPC Health Error: `, error);
        }
      }),
    );
    logDebug('Updated RPC Health', this.rpcHealth);
    setTimeout(() => this.updateRPCHealth(), UPDATE_INTERVAL);
  }

  status() {
    return this.rpcHealth;
  }

  setHealth(chainId, blockNumber) {
    this.rpcHealth[chainId] = blockNumber;
  }
}

const rpcHealthStore = new RPCHealthStore();

export const getRPCHealth = () => rpcHealthStore.status();

export const setRPCHealth = (chainId, blockNumber) => {
  rpcHealthStore.setHealth(chainId, blockNumber);
};

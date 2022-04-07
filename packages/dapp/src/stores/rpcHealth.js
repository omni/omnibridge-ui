import { chainUrls } from 'lib/constants';
import { logDebug, logError } from 'lib/helpers';
import { getEthersProvider } from 'lib/providers';

const { REACT_APP_RPC_HEALTH_UPDATE_INTERVAL } = process.env;

const DEFAULT_RPC_HEALTH_UPDATE_INTERVAL = 60000;

const UPDATE_INTERVAL =
  REACT_APP_RPC_HEALTH_UPDATE_INTERVAL || DEFAULT_RPC_HEALTH_UPDATE_INTERVAL;

class RPCHealthStore {
  rpcHealth = {};

  constructor() {
    this.updateRPCHealth();
  }

  async updateRPCHealth() {
    await Promise.all(
      Object.entries(chainUrls).map(async ([chainId, { name }]) => {
        try {
          const provider = await getEthersProvider(chainId);
          this.rpcHealth[chainId] = (await provider?.getBlockNumber()) ?? null;
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
}

const rpcHealthStore = new RPCHealthStore();

export const getRPCHealth = () => rpcHealthStore.status();

import { getHealthStatus } from 'lib/graphHealth';
import { logDebug } from 'lib/helpers';
import { networks } from 'lib/networks';

const subgraphs = [];
Object.values(networks).forEach(info => {
  subgraphs.push(info.homeGraphName);
  subgraphs.push(info.foreignGraphName);
});

const { REACT_APP_GRAPH_HEALTH_UPDATE_INTERVAL } = process.env;

const DEFAULT_GRAPH_HEALTH_UPDATE_INTERVAL = 60000;

const UPDATE_INTERVAL =
  REACT_APP_GRAPH_HEALTH_UPDATE_INTERVAL ||
  DEFAULT_GRAPH_HEALTH_UPDATE_INTERVAL;

class GraphHealthStore {
  graphHealth = {};

  constructor() {
    this.updateGraphHealth();
  }

  async updateGraphHealth() {
    await Promise.all(
      subgraphs.map(async subgraph => {
        const status = await getHealthStatus(subgraph);
        this.graphHealth[subgraph] = status;
      }),
    );
    logDebug('Updated Graph Health', this.graphHealth);
    setTimeout(() => this.updateGraphHealth(), UPDATE_INTERVAL);
  }

  status() {
    return this.graphHealth;
  }
}

const graphHealthStore = new GraphHealthStore();

export const getGraphHealth = () => graphHealthStore.status();

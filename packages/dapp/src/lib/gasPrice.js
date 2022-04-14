import axios from 'axios';
import { BigNumber, utils } from 'ethers';
import { GasPriceOracle } from 'gas-price-oracle';
import { logDebug, logError } from 'lib/helpers';

const lowest = arr =>
  arr.reduce((low, item) => (low > item ? item : low), arr[0]);

const median = arr => {
  const mid = Math.floor(arr.length / 2);
  const nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

const gasPriceOracle = new GasPriceOracle();

const gasPriceFromSupplier = async () => {
  try {
    const json = await gasPriceOracle.fetchGasPricesOffChain();

    if (!json) {
      logError(`Response from Oracle didn't include gas price`);
      return null;
    }

    const returnJson = {};
    for (const speedType in json) {
      if (Object.prototype.hasOwnProperty.call(json, speedType)) {
        returnJson[speedType] = utils.parseUnits(
          json[speedType].toFixed(2),
          'gwei',
        );
      }
    }
    if (Object.keys(returnJson).length > 0) {
      return returnJson;
    }
    return null;
  } catch (e) {
    logError(`Gas Price Oracle not available. ${e.message}`);
  }
  return null;
};

const {
  REACT_APP_GAS_PRICE_FALLBACK_GWEI,
  REACT_APP_GAS_PRICE_SPEED_TYPE,
  REACT_APP_GAS_PRICE_UPDATE_INTERVAL,
} = process.env;

const DEFAULT_GAS_PRICE_SPEED_TYPE = 'standard';
const DEFAULT_GAS_PRICE_UPDATE_INTERVAL = 60000;

class GasPriceStore {
  gasPrice = BigNumber.from('0');

  fastGasPrice = BigNumber.from('0');

  speedType = DEFAULT_GAS_PRICE_SPEED_TYPE;

  updateInterval = DEFAULT_GAS_PRICE_UPDATE_INTERVAL;

  medianHistoricalPrice = BigNumber.from('0');

  lowestHistoricalPrice = BigNumber.from('0');

  constructor() {
    this.gasPrice = utils.parseUnits(
      REACT_APP_GAS_PRICE_FALLBACK_GWEI || '0',
      'gwei',
    );
    this.medianHistoricalPrice = utils.parseUnits(
      REACT_APP_GAS_PRICE_FALLBACK_GWEI || '0',
      'gwei',
    );

    this.fastGasPrice = utils.parseUnits(
      REACT_APP_GAS_PRICE_FALLBACK_GWEI || '0',
      'gwei',
    );
    this.speedType =
      REACT_APP_GAS_PRICE_SPEED_TYPE || DEFAULT_GAS_PRICE_SPEED_TYPE;
    this.updateInterval =
      REACT_APP_GAS_PRICE_UPDATE_INTERVAL || DEFAULT_GAS_PRICE_UPDATE_INTERVAL;
    this.updateGasPrice();
    this.updateHistoricalPrice();
  }

  async updateGasPrice() {
    const gasPrices = await gasPriceFromSupplier();
    try {
      if (gasPrices) {
        this.gasPrice = gasPrices[this.speedType];
        this.fastGasPrice = gasPrices.fast;
      }
    } catch (gasPriceError) {
      logError({ gasPriceError });
    }

    logDebug('Updated Gas Price', { gasPrices });

    setTimeout(() => this.updateGasPrice(), this.updateInterval);
  }

  async updateHistoricalPrice() {
    const response = await axios.get(
      `https://ethgas.watch/api/gas/trend?hours=168`,
    );
    if (response.status !== 200) {
      throw new Error(`Fetch gasPrice from ethgasAPI failed!`);
    }
    const { normal } = response.data;
    this.medianHistoricalPrice = utils.parseUnits(
      median(normal).toString(),
      'gwei',
    );
    this.lowestHistoricalPrice = utils.parseUnits(
      lowest(normal).toString(),
      'gwei',
    );
    setTimeout(() => this.updateHistoricalPrice(), this.updateInterval);
  }
}

const ethGasStore = new GasPriceStore();

export const getGasPrice = () => ethGasStore.gasPrice;

export const getFastGasPrice = () => ethGasStore.fastGasPrice;

export const getLowestHistoricalEthGasPrice = () =>
  ethGasStore.lowestHistoricalPrice;

export const getMedianHistoricalEthGasPrice = () =>
  ethGasStore.medianHistoricalPrice;

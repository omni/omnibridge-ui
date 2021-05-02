import axios from 'axios';
import { utils } from 'ethers';
import { GasPriceOracle } from 'gas-price-oracle';
import { logError } from 'lib/helpers';

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
const DEFAULT_GAS_PRICE_UPDATE_INTERVAL = 15000;

class GasPriceStore {
  gasPrice = null;

  fastGasPrice = null;

  speedType = null;

  updateInterval = null;

  medianHistoricalPrice = null;

  lowestHistoricalPrice = null;

  constructor() {
    this.gasPrice = utils.parseUnits(
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

    setTimeout(() => this.updateGasPrice(), this.updateInterval);
  }

  gasPriceInHex() {
    if (this.gasPrice.gt(0)) {
      return this.gasPrice.toHexString();
    }
    return undefined;
  }

  fastGasPriceInBN() {
    if (this.fastGasPrice.gt(0)) {
      return this.fastGasPrice;
    }
    return utils.parseUnits('50', 'gwei').toHexString();
  }

  async updateHistoricalPrice() {
    const response = await axios.get(
      `https://ethgas.watch/api/gas/trend?hours=168`,
    );
    if (response.status !== 200) {
      throw new Error(`Fetch gasPrice from ethgasAPI failed!`);
    }
    const { normal } = response.data;
    this.medianHistoricalPrice = median(normal);
    this.lowestHistoricalPrice = lowest(normal);
    setTimeout(() => this.updateHistoricalPrice(), this.updateInterval);
  }
}

const ethGasStore = new GasPriceStore();

export const getGasPrice = () => {
  return ethGasStore.gasPrice;
};

export const getFastGasPrice = () => {
  return ethGasStore.fastGasPriceInBN();
};

const lowest = arr => {
  return arr.reduce((low, item) => (low > item ? item : low), arr[0]);
};

const median = arr => {
  const mid = Math.floor(arr.length / 2);
  const nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

export const getLowestHistoricalEthGasPrice = () => {
  return utils.parseUnits(ethGasStore.lowestHistoricalPrice.toString(), 'gwei');
};

export const getMedianHistoricalEthGasPrice = () => {
  return utils.parseUnits(ethGasStore.medianHistoricalPrice.toString(), 'gwei');
};

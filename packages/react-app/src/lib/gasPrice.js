import { utils } from 'ethers';

import { isxDaiChain } from './helpers';

const gasPriceWithinLimits = (gasPrice, limits) => {
  if (!limits) {
    return gasPrice;
  }
  if (gasPrice < limits.MIN) {
    return limits.MIN;
  }
  if (gasPrice > limits.MAX) {
    return limits.MAX;
  }
  return gasPrice;
};

const normalizeGasPrice = (oracleGasPrice, limits = null) => {
  let gasPrice = oracleGasPrice;
  gasPrice = gasPriceWithinLimits(gasPrice, limits);
  return utils.parseUnits(gasPrice.toFixed(2).toString(), 'gwei');
};

const gasPriceFromSupplier = async (fetchFn, options = {}) => {
  try {
    const response = await fetchFn();
    const json = await response.json();
    const oracleGasPrice = json[options.speedType];
    const oracleFastGasPrice = json.fast;

    if (!oracleGasPrice) {
      options.logger &&
        options.logger.error &&
        options.logger.error(
          `Response from Oracle didn't include gas price for ${options.speedType} type.`,
        );
      return null;
    }

    const normalizedGasPrice = normalizeGasPrice(
      oracleGasPrice,
      options.limits,
    );

    const normalizedFastGasPrice = normalizeGasPrice(
      oracleFastGasPrice,
      options.limits,
    );

    options.logger &&
      options.logger.debug &&
      options.logger.debug(
        { oracleGasPrice, normalizedGasPrice },
        'Gas price updated using the API',
      );

    return [normalizedGasPrice, normalizedFastGasPrice];
  } catch (e) {
    options.logger &&
      options.logger.error &&
      options.logger.error(`Gas Price API is not available. ${e.message}`);
  }
  return null;
};

const {
  REACT_APP_GAS_PRICE_FALLBACK_GWEI,
  REACT_APP_GAS_PRICE_SUPPLIER_URL,
  REACT_APP_GAS_PRICE_SPEED_TYPE,
  REACT_APP_GAS_PRICE_UPDATE_INTERVAL,
} = process.env;

const DEFAULT_GAS_PRICE_FALLBACK_GWEI = '0';
const DEFAULT_GAS_PRICE_SUPPLIER_URL = 'https://gasprice.poa.network/';
const DEFAULT_GAS_PRICE_SPEED_TYPE = 'standard';
const DEFAULT_GAS_PRICE_UPDATE_INTERVAL = 15000;

class GasPriceStore {
  gasPrice = null;

  fastGasPrice = null;

  gasPriceSupplierUrl = null;

  speedType = null;

  updateInterval = null;

  constructor() {
    this.gasPrice = utils.parseUnits(
      REACT_APP_GAS_PRICE_FALLBACK_GWEI || DEFAULT_GAS_PRICE_FALLBACK_GWEI,
      'gwei',
    );
    this.fastGasPrice = utils.parseUnits(
      REACT_APP_GAS_PRICE_FALLBACK_GWEI || DEFAULT_GAS_PRICE_FALLBACK_GWEI,
      'gwei',
    );
    this.gasPriceSupplierUrl =
      REACT_APP_GAS_PRICE_SUPPLIER_URL || DEFAULT_GAS_PRICE_SUPPLIER_URL;
    this.speedType =
      REACT_APP_GAS_PRICE_SPEED_TYPE || DEFAULT_GAS_PRICE_SPEED_TYPE;
    this.updateInterval =
      REACT_APP_GAS_PRICE_UPDATE_INTERVAL || DEFAULT_GAS_PRICE_UPDATE_INTERVAL;
    this.updateGasPrice();
  }

  async updateGasPrice() {
    const oracleOptions = {
      speedType: this.speedType,
      logger: console,
    };
    const fetchFn = () => fetch(this.gasPriceSupplierUrl);
    if (this.gasPriceSupplierUrl) {
      [this.gasPrice, this.fastGasPrice] = await gasPriceFromSupplier(
        fetchFn,
        oracleOptions,
      );
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
}

const foreignGasStore = new GasPriceStore();

export const getGasPrice = chainId => {
  if (isxDaiChain(chainId)) {
    return utils.parseUnits('1', 'gwei').toHexString();
  }
  return foreignGasStore.gasPriceInHex();
};

export const getFastGasPrice = () => {
  return foreignGasStore.fastGasPriceInBN();
};

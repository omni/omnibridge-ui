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

const normalizeGasPrice = (oracleGasPrice, factor, limits = null) => {
  let gasPrice = oracleGasPrice * factor;
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
      options.factor,
      options.limits,
    );

    const normalizedFastGasPrice = normalizeGasPrice(
      oracleFastGasPrice,
      options.factor,
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
  REACT_APP_HOME_GAS_PRICE_FALLBACK_GWEI,
  REACT_APP_HOME_GAS_PRICE_SUPPLIER_URL,
  REACT_APP_HOME_GAS_PRICE_SPEED_TYPE,
  REACT_APP_HOME_GAS_PRICE_UPDATE_INTERVAL,
  REACT_APP_HOME_GAS_PRICE_FACTOR,
  REACT_APP_FOREIGN_GAS_PRICE_FALLBACK_GWEI,
  REACT_APP_FOREIGN_GAS_PRICE_SUPPLIER_URL,
  REACT_APP_FOREIGN_GAS_PRICE_SPEED_TYPE,
  REACT_APP_FOREIGN_GAS_PRICE_UPDATE_INTERVAL,
  REACT_APP_FOREIGN_GAS_PRICE_FACTOR,
} = process.env;

const DEFAULT_GAS_PRICE_FACTOR = 1;
const DEFAULT_GAS_PRICE_UPDATE_INTERVAL = 900000;

class GasPriceStore {
  gasPrice = null;

  fastGasPrice = null;

  gasPriceSupplierUrl = null;

  speedType = null;

  updateInterval = null;

  factor = null;

  constructor(isxDai) {
    if (isxDai) {
      this.gasPrice = utils.parseUnits(
        REACT_APP_HOME_GAS_PRICE_FALLBACK_GWEI || '0',
        'gwei',
      );
      this.fastGasPrice = utils.parseUnits(
        REACT_APP_HOME_GAS_PRICE_FALLBACK_GWEI || '0',
        'gwei',
      );
      this.gasPriceSupplierUrl = REACT_APP_HOME_GAS_PRICE_SUPPLIER_URL;
      this.speedType = REACT_APP_HOME_GAS_PRICE_SPEED_TYPE;
      this.updateInterval =
        REACT_APP_HOME_GAS_PRICE_UPDATE_INTERVAL ||
        DEFAULT_GAS_PRICE_UPDATE_INTERVAL;
      this.factor =
        Number(REACT_APP_HOME_GAS_PRICE_FACTOR) || DEFAULT_GAS_PRICE_FACTOR;
    } else {
      this.gasPrice = utils.parseUnits(
        REACT_APP_FOREIGN_GAS_PRICE_FALLBACK_GWEI || '0',
        'gwei',
      );
      this.fastGasPrice = utils.parseUnits(
        REACT_APP_FOREIGN_GAS_PRICE_FALLBACK_GWEI || '0',
        'gwei',
      );
      this.gasPriceSupplierUrl = REACT_APP_FOREIGN_GAS_PRICE_SUPPLIER_URL;
      this.speedType = REACT_APP_FOREIGN_GAS_PRICE_SPEED_TYPE;
      this.updateInterval =
        REACT_APP_FOREIGN_GAS_PRICE_UPDATE_INTERVAL ||
        DEFAULT_GAS_PRICE_UPDATE_INTERVAL;
      this.factor =
        Number(REACT_APP_FOREIGN_GAS_PRICE_FACTOR) || DEFAULT_GAS_PRICE_FACTOR;
    }
    this.updateGasPrice();
  }

  async updateGasPrice() {
    const oracleOptions = {
      speedType: this.speedType,
      factor: this.factor,
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
    return undefined;
  }
}

const homeGasStore = new GasPriceStore(true);
const foreignGasStore = new GasPriceStore(false);

export const getGasPrice = chainId => {
  if (isxDaiChain(chainId)) {
    return homeGasStore.gasPriceInHex();
  }
  return foreignGasStore.gasPriceInHex();
};

export const getFastGasPrice = () => {
  return foreignGasStore.fastGasPriceInBN();
};

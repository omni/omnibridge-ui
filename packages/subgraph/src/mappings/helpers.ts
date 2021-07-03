import { Bytes, Address, log, dataSource } from '@graphprotocol/graph-ts';

import { Token } from '../types/Omnibridge/Token';
import { Token as TokenEntity } from '../types/schema';

class TokenObject {
  address: Address;
  name: string;
  symbol: string;
  decimals: i32;
}

export function getDirection(): String {
  let network = dataSource.network();
  let address = dataSource.address();
  if (network == 'xdai') {
    if (
      address ==
      Address.fromString('0x59447362798334d3485c64D1e4870Fde2DDC0d75')
      // must add other bsc-xdai dedication-bridge addresses here in the future (if any)
    ) {
      return 'bsc-xdai';
    }
    return 'mainnet-xdai';
  } else if (network == 'mainnet') {
    if (
      address ==
      Address.fromString('0x69c707d975e8d883920003CC357E556a4732CD03')
    ) {
      return 'mainnet-bsc';
    }
    return 'mainnet-xdai';
  } else if (network == 'bsc') {
    if (
      address ==
      Address.fromString('0xD83893F31AA1B6B9D97C9c70D3492fe38D24d218')
    ) {
      return 'mainnet-bsc';
    }
    return 'bsc-xdai';
  } else if (network == 'poa-sokol' || network == 'kovan') {
    return 'kovan-sokol';
  }
  return '';
}

export function fetchTokenInfo(address: Address): TokenObject {
  let tokenInstance = Token.bind(address);
  log.debug('TokenContract at {}', [address.toHex()]);
  let tokenObject = new TokenObject();
  tokenObject.address = address;

  let name = tokenInstance.try_name();
  let symbol = tokenInstance.try_symbol();
  let decimals = tokenInstance.try_decimals();

  if (!name.reverted) {
    tokenObject.name = name.value;
  }

  if (!symbol.reverted) {
    tokenObject.symbol = symbol.value;
  }

  if (!decimals.reverted) {
    tokenObject.decimals = decimals.value;
  }

  return tokenObject;
}

export function updateHomeToken(tokenAddress: Address): void {
  let token = TokenEntity.load(tokenAddress.toHexString());
  if (token == null) {
    let tokenInfo = fetchTokenInfo(tokenAddress);
    updateHomeTokenInfo(tokenAddress, tokenInfo);
  }
}

export function updateHomeTokenInfo(
  tokenAddress: Address,
  tokenObject: TokenObject,
): void {
  let token = TokenEntity.load(tokenAddress.toHexString());
  if (token == null) {
    let token = new TokenEntity(tokenAddress.toHexString());

    token.symbol = tokenObject.symbol;
    token.decimals = tokenObject.decimals;
    token.homeAddress = tokenAddress;

    let network = dataSource.network();
    if (network == 'xdai') {
      token.homeChainId = 100;
      token.homeName = tokenObject.name;
    } else if (network == 'poa-sokol') {
      token.homeChainId = 77;
      token.homeName = tokenObject.name;
    } else if (network == 'kovan') {
      token.homeChainId = 42;
      token.homeName = tokenObject.name;
    } else if (network == 'mainnet') {
      token.homeChainId = 1;
      token.homeName = tokenObject.name;
    } else if (network == 'bsc') {
      token.homeChainId = 56;
      token.homeName = tokenObject.name;
    }

    token.save();
    log.debug('New overridden homeToken {}', [token.homeAddress.toHexString()]);
  }
}

// headerLength = 79 + sourceChainIdLength + destinationChainIdLength
// for bsc, sokol, kovan, xdai and mainnet chainId < 255
// => len(chainId) = 1
var HEADER_LENGTH = 79 + 1 + 1;
var METHOD_SIGNATURE_LENGTH = 4;
var PADDED_LENGTH = 32;
var ADDRESS_LENGTH = 20;

var handleNativeTokensAndCall = Bytes.fromHexString('0x867f7a4d') as Bytes;
var handleNativeTokens = Bytes.fromHexString('0x272255bb') as Bytes;
var handleBridgedTokensAndCall = Bytes.fromHexString('0xc5345761') as Bytes;
var handleBridgedTokens = Bytes.fromHexString('0x125e4cfb') as Bytes;
var deployAndHandleBridgedTokensAndCall = Bytes.fromHexString(
  '0xd522cfd7',
) as Bytes;
var deployAndHandleBridgedTokens = Bytes.fromHexString('0x2ae87cdd') as Bytes;

export function decodeRecipient(encodedData: Bytes): Bytes {
  let data = encodedData.subarray(HEADER_LENGTH + METHOD_SIGNATURE_LENGTH);
  let method = encodedData.subarray(
    HEADER_LENGTH,
    HEADER_LENGTH + METHOD_SIGNATURE_LENGTH,
  ) as Bytes;

  if (
    method == handleNativeTokens ||
    method == handleNativeTokensAndCall ||
    method == handleBridgedTokens ||
    method == handleBridgedTokensAndCall
  ) {
    // _token, 0 - 32
    // _receiver, 32 - 64
    // _value, 64 - 96
    return data.subarray(
      2 * PADDED_LENGTH - ADDRESS_LENGTH, // removing padded zeros
      2 * PADDED_LENGTH,
    ) as Bytes;
  } else if (
    method == deployAndHandleBridgedTokens ||
    method == deployAndHandleBridgedTokensAndCall
  ) {
    // _token, 0 - 32
    // name, 32 - 64
    // symbol, 64 - 96
    // _decimals, 96 - 128
    // _receiver, 128 - 160
    // _value, 160 - 192
    return data.subarray(
      5 * PADDED_LENGTH - ADDRESS_LENGTH, // removing padded zeros
      5 * PADDED_LENGTH,
    ) as Bytes;
  }
  return null;
}

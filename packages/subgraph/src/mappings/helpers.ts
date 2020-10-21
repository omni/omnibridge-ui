import { Address, TypedMap, log } from '@graphprotocol/graph-ts';

import { Token } from '../types/Mediator/Token';

class TokenObject {
  address: Address;
  name: string;
  symbol: string;
  decimals: i32;
}

function getOverrides(): TypedMap<Address, TokenObject> {
  let overrides = new TypedMap<Address, TokenObject>();

  // **** OVERRIDES START ****
  // NOTE: need to set values for both old and new address
  let owlOverride = new TokenObject();
  owlOverride.address = Address.fromString(
    '0x0905Ab807F8FD040255F0cF8fa14756c1D824931',
  );
  owlOverride.name = 'OWL on xDAI';
  owlOverride.symbol = 'OWL';
  owlOverride.decimals = 18;
  overrides.set(
    Address.fromString('0x750ecf8c11867ce5dbc556592c5bb1e0c6d16538'),
    owlOverride,
  );
  overrides.set(
    Address.fromString('0x0905Ab807F8FD040255F0cF8fa14756c1D824931'),
    owlOverride,
  );
  // **** OVERRIDES END ****

  return overrides;
}

export var overrides = getOverrides();

export function fetchTokenInfo(address: Address): TokenObject | null {
  if (overrides.isSet(address)) return overrides.get(address);

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

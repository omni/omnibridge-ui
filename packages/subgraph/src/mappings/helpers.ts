import { Address, log } from '@graphprotocol/graph-ts';

import { Token } from '../types/Mediator/Token';

class TokenObject {
  name: string;
  symbol: string;
  decimals: i32;
}

export function fetchTokenInfo(address: Address): TokenObject | null {
  let tokenInstance = Token.bind(address);
  log.debug('TokenContract at {}', [address.toHex()]);
  let tokenObject = new TokenObject();

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

import { log, dataSource } from '@graphprotocol/graph-ts';
import { TokensBridged, NewTokenRegistered } from '../types/Mediator/Mediator';
import { BridgeTransfer, Token } from '../types/schema';

import { fetchTokenInfo } from './helpers';

export function handleBridgeTransfer(event: TokensBridged): void {
  log.debug('Parsing TokensBridged', []);
  let txHash = event.transaction.hash.toHex();
  let transfer = new BridgeTransfer(txHash);
  transfer.txHash = txHash;
  transfer.timestamp = event.block.timestamp;
  transfer.token = event.params.token;
  transfer.recipient = event.params.recipient;
  transfer.value = event.params.value;
  transfer.messageId = event.params.messageId;
  transfer.save();
  log.debug('TokensBridged token {}', [transfer.token.toHex()]);
}

export function handleNewToken(event: NewTokenRegistered): void {
  log.debug('Parsing NewTokenRegistered', []);
  let id = event.params.homeToken.toHex();
  let token = new Token(id);
  token.homeAddress = event.params.homeToken;
  token.foreignAddress = event.params.foreignToken;

  let tokenObject = fetchTokenInfo(event.params.homeToken);
  token.homeName = tokenObject.name;
  token.foreignName = tokenObject.name.slice(0, -8);
  token.symbol = tokenObject.symbol;
  token.decimals = tokenObject.decimals;

  let network = dataSource.network();
  if (network == 'xdai') {
    token.homeChainId = 100;
    token.foreignChainId = 1;
  } else if (network == 'poa-sokol') {
    token.homeChainId = 77;
    token.foreignChainId = 42;
  }

  token.save();
  log.debug('NewTokenRegistered homeToken {} and foreignToken {}', [
    token.homeAddress.toHex(),
    token.foreignAddress.toHex(),
  ]);
}

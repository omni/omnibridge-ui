import { log } from '@graphprotocol/graph-ts';
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
  token.name = tokenObject.name;
  token.symbol = tokenObject.symbol;
  token.decimals = tokenObject.decimals;

  token.save();
  log.debug('NewTokenRegistered homeToken {} and foreignToken {}', [
    token.homeAddress.toHex(),
    token.foreignAddress.toHex(),
  ]);
}

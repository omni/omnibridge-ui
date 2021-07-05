import { log, dataSource } from '@graphprotocol/graph-ts';
import {
  TokensBridgingInitiated,
  TokensBridged,
  NewTokenRegistered,
} from '../types/Omnibridge/Omnibridge';
import { Execution, UserRequest, Token } from '../types/schema';

import { fetchTokenInfo, getDirection } from './helpers';

import { getOverrides } from './overrides';

export function handleBridgeTransfer(event: TokensBridged): void {
  log.debug('Parsing TokensBridged for txHash {}', [
    event.transaction.hash.toHexString(),
  ]);
  let txHash = event.transaction.hash;
  let execution = Execution.load(txHash.toHexString());
  if (execution == null) {
    execution = new Execution(txHash.toHexString());
  }
  execution.txHash = txHash;
  execution.timestamp = event.block.timestamp;
  execution.token = event.params.token;
  execution.user = event.params.recipient;
  execution.amount = event.params.value;
  execution.messageId = event.params.messageId;
  execution.save();
  log.debug('TokensBridged token {}', [execution.token.toHexString()]);
}

export function handleInitiateTransfer(event: TokensBridgingInitiated): void {
  log.debug('Parsing TokensBridgingInitiated for txHash {}', [
    event.transaction.hash.toHexString(),
  ]);
  let txHash = event.transaction.hash;
  let request = UserRequest.load(txHash.toHexString());
  if (request == null) {
    request = new UserRequest(txHash.toHexString());
  }
  request.txHash = txHash;
  request.timestamp = event.block.timestamp;
  request.token = event.params.token;
  let tokenInfo = fetchTokenInfo(event.params.token);
  request.decimals = tokenInfo.decimals;
  request.symbol = tokenInfo.symbol;
  request.user = event.params.sender;
  request.amount = event.params.value;
  request.messageId = event.params.messageId;
  request.save();
  log.debug('TokensBridgingInitiated token {}', [request.token.toHexString()]);
}

export function handleNewToken(event: NewTokenRegistered): void {
  log.debug('Parsing NewTokenRegistered', []);

  let overrides = getOverrides();

  if (
    overrides.isSet(event.params.foreignToken) ||
    overrides.isSet(event.params.homeToken)
  ) {
    return;
  }

  let token = new Token(event.params.homeToken.toHexString());
  token.homeAddress = event.params.homeToken;
  token.foreignAddress = event.params.foreignToken;

  let tokenObject = fetchTokenInfo(event.params.homeToken);
  token.symbol = tokenObject.symbol;
  token.decimals = tokenObject.decimals;

  let network = dataSource.network();
  let direction = getDirection();
  if (network == 'xdai' && direction == 'mainnet-xdai') {
    token.homeChainId = 100;
    token.foreignChainId = 1;
    token.homeName = tokenObject.name;
    token.foreignName = tokenObject.name.slice(0, -8);
  } else if (network == 'xdai' && direction == 'bsc-xdai') {
    token.homeChainId = 100;
    token.foreignChainId = 56;
    token.homeName = tokenObject.name;
    token.foreignName = tokenObject.name.slice(0, -8);
  } else if (network == 'poa-sokol') {
    token.homeChainId = 77;
    token.foreignChainId = 42;
    token.homeName = tokenObject.name;
    token.foreignName = tokenObject.name.slice(0, -8);
  } else if (network == 'kovan') {
    token.homeChainId = 42;
    token.foreignChainId = 77;
    token.homeName = tokenObject.name;
    token.foreignName = tokenObject.name.slice(0, -11);
  } else if (network == 'mainnet' && direction == 'mainnet-bsc') {
    token.homeChainId = 1;
    token.foreignChainId = 56;
    token.homeName = tokenObject.name;
    token.foreignName = tokenObject.name.slice(0, -11);
  } else if (network == 'mainnet' && direction == 'mainnet-xdai') {
    token.homeChainId = 1;
    token.foreignChainId = 100;
    token.homeName = tokenObject.name;
    token.foreignName = tokenObject.name.slice(0, -11);
  } else if (network == 'bsc' && direction == 'mainnet-bsc') {
    token.homeChainId = 56;
    token.foreignChainId = 1;
    token.homeName = tokenObject.name;
    token.foreignName = tokenObject.name.slice(0, -7);
  } else if (network == 'bsc' && direction == 'bsc-xdai') {
    token.homeChainId = 56;
    token.foreignChainId = 100;
    token.homeName = tokenObject.name;
    token.foreignName = tokenObject.name.slice(0, -7);
  }

  token.save();
  log.debug('NewTokenRegistered homeToken {} and foreignToken {}', [
    token.homeAddress.toHexString(),
    token.foreignAddress.toHexString(),
  ]);
}

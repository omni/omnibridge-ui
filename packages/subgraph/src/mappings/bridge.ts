import { log, dataSource } from '@graphprotocol/graph-ts';
import {
  TokensBridgingInitiated,
  TokensBridged,
  NewTokenRegistered,
} from '../types/Mediator/Mediator';
import { Execution, UserRequest, Token } from '../types/schema';

import { fetchTokenInfo, overrides } from './helpers';

export function handleBridgeTransfer(event: TokensBridged): void {
  log.debug('Parsing TokensBridged', []);
  let txHash = event.transaction.hash.toHex();
  let execution = Execution.load(txHash);
  if (execution == null) {
    execution = new Execution(txHash);
  }
  execution.txHash = txHash;
  execution.timestamp = event.block.timestamp;
  execution.token = event.params.token;
  execution.user = event.params.recipient;
  execution.amount = event.params.value;
  execution.messageId = event.params.messageId;
  execution.save();
  log.debug('TokensBridged token {}', [execution.token.toHex()]);
}

export function handleInitiateTransfer(event: TokensBridgingInitiated): void {
  log.debug('Parsing TokensBridged', []);
  let txHash = event.transaction.hash.toHex();
  let request = UserRequest.load(txHash);
  if (request == null) {
    request = new UserRequest(txHash);
  }
  request.txHash = txHash;
  request.timestamp = event.block.timestamp;
  request.token = event.params.token;
  request.user = event.params.sender;
  request.amount = event.params.value;
  request.messageId = event.params.messageId;
  request.save();
  log.debug('TokensBridgingInitiated token {}', [request.token.toHex()]);
}

export function handleNewToken(event: NewTokenRegistered): void {
  log.debug('Parsing NewTokenRegistered', []);
  let homeToken = event.params.homeToken;

  if (overrides.isSet(homeToken)) {
    let override = overrides.get(homeToken);
    log.info('Overriding homeToken {} with {} for foreignToken {}', [
      homeToken.toHex(),
      override.address.toHex(),
      event.params.foreignToken.toHex(),
    ]);
    homeToken = override.address;
  }
  let id = homeToken.toHex();
  let token = new Token(id);
  token.homeAddress = homeToken;
  token.foreignAddress = event.params.foreignToken;

  let tokenObject = fetchTokenInfo(homeToken);
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

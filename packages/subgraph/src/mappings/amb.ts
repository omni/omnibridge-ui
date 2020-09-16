import { log } from '@graphprotocol/graph-ts';
import {
  UserRequestForAffirmation,
  UserRequestForSignature,
} from '../types/AMB/AMB';

import { UserRequest } from '../types/schema';

export function handleUserRequestForAffirmation(
  event: UserRequestForAffirmation,
): void {
  log.debug('Parsing UserRequestForAffirmation', []);
  let txHash = event.transaction.hash.toHex();
  let request = new UserRequest(txHash);
  request.txHash = txHash;
  request.timestamp = event.block.timestamp;
  request.user = event.transaction.from;
  request.save();
}

export function handleUserRequestForSignature(
  event: UserRequestForSignature,
): void {
  log.debug('Parsing UserRequestForSignature', []);
  let txHash = event.transaction.hash.toHex();
  let request = new UserRequest(txHash);
  request.txHash = txHash;
  request.timestamp = event.block.timestamp;
  request.user = event.transaction.from;
  request.save();
}

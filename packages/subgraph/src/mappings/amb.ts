import { BigInt, Bytes, log, crypto } from '@graphprotocol/graph-ts';
import {
  UserRequestForAffirmation,
  UserRequestForSignature,
  RelayedMessage,
  AffirmationCompleted,
  CollectedSignatures,
  AMB,
} from '../types/AMB/AMB';

import { UserRequest, Execution, Message } from '../types/schema';

import { decodeRecipient } from './helpers';

export function handleUserRequestForAffirmation(
  event: UserRequestForAffirmation,
): void {
  log.debug('Parsing UserRequestForAffirmation', []);
  let txHash = event.transaction.hash;
  let request = UserRequest.load(txHash.toHexString());
  if (request == null) {
    request = new UserRequest(txHash.toHexString());
  }
  let message = new Message(
    crypto.keccak256(event.params.encodedData).toHexString(),
  );
  message.msgId = event.params.messageId;
  message.txHash = txHash;
  message.save();
  request.txHash = txHash;
  request.timestamp = event.block.timestamp;
  request.messageId = event.params.messageId;
  request.message = message.id;
  request.encodedData = event.params.encodedData;
  request.recipient = decodeRecipient(event.params.encodedData);
  request.save();
}

export function handleUserRequestForSignature(
  event: UserRequestForSignature,
): void {
  log.debug('Parsing UserRequestForSignature', []);
  let txHash = event.transaction.hash;
  let request = UserRequest.load(txHash.toHexString());
  if (request == null) {
    request = new UserRequest(txHash.toHexString());
  }
  let message = new Message(
    crypto.keccak256(event.params.encodedData).toHexString(),
  );
  message.msgId = event.params.messageId;
  message.txHash = txHash;
  message.save();
  request.txHash = txHash;
  request.timestamp = event.block.timestamp;
  request.messageId = event.params.messageId;
  request.message = message.id;
  request.encodedData = event.params.encodedData;
  request.recipient = decodeRecipient(event.params.encodedData);
  request.save();
}

export function handleRelayedMessage(event: RelayedMessage): void {
  log.debug('Parsing RelayedMessage', []);
  let txHash = event.transaction.hash;
  let execution = Execution.load(txHash.toHexString());
  if (execution == null) {
    execution = new Execution(txHash.toHexString());
  }
  execution.txHash = txHash;
  execution.timestamp = event.block.timestamp;
  execution.sender = event.params.sender;
  execution.executor = event.params.executor;
  execution.messageId = event.params.messageId;
  execution.status = event.params.status;
  execution.save();
}

export function handleAffirmationCompleted(event: AffirmationCompleted): void {
  log.debug('Parsing AffirmationCompleted', []);
  let txHash = event.transaction.hash;
  let execution = Execution.load(txHash.toHexString());
  if (execution == null) {
    execution = new Execution(txHash.toHexString());
  }
  execution.txHash = txHash;
  execution.timestamp = event.block.timestamp;
  execution.sender = event.params.sender;
  execution.executor = event.params.executor;
  execution.messageId = event.params.messageId;
  execution.status = event.params.status;
  execution.save();
}

export function handleCollectedSignatures(event: CollectedSignatures): void {
  log.debug('Parsing CollectedSignatures', []);
  let ambInstance = AMB.bind(event.address);
  let message = ambInstance.try_message(event.params.messageHash);
  if (!message.reverted) {
    let msg = Message.load(crypto.keccak256(message.value).toHexString());
    if (msg != null) {
      msg.msgData = message.value;
      msg.msgHash = event.params.messageHash;
      let signatures = new Array<Bytes>();
      for (
        let i = BigInt.fromI32(0);
        i.lt(event.params.NumberOfCollectedSignatures);
        i = i.plus(BigInt.fromI32(1))
      ) {
        let signature = ambInstance.try_signature(event.params.messageHash, i);
        if (!signature.reverted) {
          signatures.push(signature.value);
        }
      }
      msg.signatures = signatures;
      msg.save();
    }
  }
}

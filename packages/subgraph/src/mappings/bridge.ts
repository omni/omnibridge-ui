import { TokensBridged } from '../types/Mediator/mediator';
import { BridgeTransfer } from '../types/schema';

export function handleBridgeTransfer(event: TokensBridged): void {
  let txHash = event.transaction.hash.toHex();
  let transfer = new BridgeTransfer(txHash);
  transfer.txHash = txHash;
  transfer.token = event.params.token;
  transfer.recipient = event.params.recipient;
  transfer.value = event.params.value;
  transfer.messageId = event.params.messageId;
  transfer.save();
}

import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { executeSignatures, TOKENS_CLAIMED } from 'lib/amb';
import { getNetworkName } from 'lib/helpers';
import { getMessage, messageCallStatus } from 'lib/message';
import { getEthersProvider } from 'lib/providers';
import { useCallback } from 'react';

export function useClaim() {
  const {
    homeChainId,
    homeAmbAddress,
    foreignChainId,
    foreignAmbAddress,
    foreignAmbVersion,
    homeRequiredSignatures,
  } = useBridgeDirection();
  const { providerChainId, ethersProvider } = useWeb3Context();

  return useCallback(
    async (txHash, txMessage) => {
      if (providerChainId !== foreignChainId) {
        throw Error(
          `Wrong network. Please connect your wallet to ${getNetworkName(
            foreignChainId,
          )}.`,
        );
      }
      let message =
        txMessage &&
        txMessage.signatures &&
        txMessage.signatures.length >= homeRequiredSignatures
          ? txMessage
          : null;
      if (!message) {
        const homeProvider = await getEthersProvider(homeChainId);
        message = await getMessage(true, homeProvider, homeAmbAddress, txHash);
      }
      const claimed = await messageCallStatus(
        foreignAmbAddress,
        ethersProvider,
        message.messageId,
      );
      if (claimed) {
        throw Error(TOKENS_CLAIMED);
      }
      return executeSignatures(
        ethersProvider,
        foreignAmbAddress,
        foreignAmbVersion,
        message,
      );
    },
    [
      homeChainId,
      homeAmbAddress,
      foreignChainId,
      foreignAmbAddress,
      foreignAmbVersion,
      providerChainId,
      ethersProvider,
      homeRequiredSignatures,
    ],
  );
}

import { Image } from '@chakra-ui/react';
import EthLogo from 'assets/eth-logo.png';
import xDAILogo from 'assets/xdai-logo.png';
import { Web3Context } from 'contexts/Web3Context';
import { isxDaiChain, uriToHttp } from 'lib/helpers';
import React, { useContext, useState } from 'react';

const BAD_SRCS = {};

/**
 * Renders an image by sequentially trying a list of URIs, and then eventually a fallback triangle alert
 */
export const Logo = ({ uri, reverseFallback = false }) => {
  const { providerChainId } = useContext(Web3Context);
  const fallbackCheck = reverseFallback
    ? !isxDaiChain(providerChainId)
    : isxDaiChain(providerChainId);
  const fallbackLogo = fallbackCheck ? xDAILogo : EthLogo;
  const [, refresh] = useState(0);

  if (uri) {
    const srcs = uriToHttp(uri);
    const src = srcs.find(s => !BAD_SRCS[s]);

    if (src) {
      return (
        <Image
          src={src}
          onError={() => {
            if (src) BAD_SRCS[src] = true;
            refresh(i => i + 1);
          }}
        />
      );
    }
  }

  return <Image src={fallbackLogo} />;
};

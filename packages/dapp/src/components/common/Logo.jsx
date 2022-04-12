import { Image } from '@chakra-ui/react';
import BSCLogo from 'assets/bsc-logo.png';
import EthLogo from 'assets/eth-logo.png';
import xDAILogo from 'assets/xdai-logo.png';
import { uriToHttp } from 'lib/helpers';
import React, { useState } from 'react';

const BAD_SRCS = {};

const logos = {
  1: EthLogo,
  42: EthLogo,
  77: xDAILogo,
  100: xDAILogo,
  56: BSCLogo,
};

export const Logo = ({ uri, chainId }) => {
  const fallbackLogo = logos[chainId] ?? logos[1];
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

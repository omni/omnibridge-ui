import { Link } from '@chakra-ui/react';
import React from 'react';

import { getExplorerUrl } from '../lib/helpers';

export const TxLink = ({ chainId, hash, children }) => {
  const link = `${getExplorerUrl(chainId)}/tx/${hash}`;
  if (hash)
    return (
      <Link
        href={link}
        w="100%"
        h="100%"
        isExternal
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        {children}
      </Link>
    );
  return children;
};

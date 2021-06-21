import { Link } from '@chakra-ui/react';
import { getExplorerUrl } from 'lib/helpers';
import React from 'react';

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

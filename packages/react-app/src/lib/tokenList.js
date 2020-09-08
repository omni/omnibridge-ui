import { gql, request } from 'graphql-request';

import {
  getBridgeNetwork,
  getGraphEndpoint,
  getTokenListUrl,
  isxDaiChain,
  uniqueTokens,
} from './helpers';

export const fetchTokenList = async chainId => {
  const repoPromise = fetchTokensFromRepo(chainId);
  const subgraphPromise = fetchTokensFromSubgraph(chainId);
  const tokens = uniqueTokens(
    (await repoPromise).concat((await subgraphPromise).tokens),
  );
  return tokens;
};

export const fetchTokensFromRepo = async chainId => {
  const url = getTokenListUrl(chainId);
  const response = await fetch(url);
  if (response.ok) {
    const data = await response.json();
    return data;
  }
  // eslint-disable-next-line
  console.log({
    defaultTokensError: 'TokenList not found on default-tokens-list repo',
  });
  return [];
};

const homeTokensQuery = gql`
  query homeTokens {
    tokens {
      chainId: homeChainId
      address: homeAddress
      name: homeName
      symbol
      decimals
    }
  }
`;

const foreignTokensQuery = gql`
  query foreignTokens {
    tokens {
      chainId: foreignChainId
      address: foreignAddress
      name: foreignName
      symbol
      decimals
    }
  }
`;

export const fetchTokensFromSubgraph = async chainId => {
  const isxDai = isxDaiChain(chainId);
  const xDaiChainId = isxDai ? chainId : getBridgeNetwork(chainId);

  const endpoint = getGraphEndpoint(xDaiChainId);
  const query = isxDai ? homeTokensQuery : foreignTokensQuery;

  return request(endpoint, query);
};

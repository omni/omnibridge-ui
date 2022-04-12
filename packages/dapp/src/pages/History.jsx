import { BridgeHistory } from 'components/history/BridgeHistory';
import query from 'query-string';
import React from 'react';

export const History = ({ location }) => {
  const parsed = query.parse(location.search);
  const page = parseInt(parsed.page, 10);
  const pageNumber = isNaN(page) || page <= 0 ? 1 : page;
  return <BridgeHistory page={pageNumber} />;
};

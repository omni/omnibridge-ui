import { createIcon } from '@chakra-ui/icons';
import * as React from 'react';

export const WalletIcon = createIcon({
  displayName: 'WalletIcon',
  path: (
    <>
      <path
        d="M12 10C11.4477 10 11 10.4477 11 11C11 11.5523 11.4477 12 12 12H13C13.5523 12 14 11.5523 14 11C14 10.4477 13.5523 10 13 10H12Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 0C1.79086 0 0 1.79086 0 4V14C0 16.2091 1.79086 18 4 18H14C16.2091 18 18 16.2091 18 14V8C18 5.79086 16.2091 4 14 4C14 1.79086 12.2091 0 10 0H4ZM12 4H2C2 2.89543 2.89543 2 4 2H10C11.1046 2 12 2.89543 12 4ZM2 14V6H14C15.1046 6 16 6.89543 16 8V14C16 15.1046 15.1046 16 14 16H4C2.89543 16 2 15.1046 2 14Z"
        fill="currentColor"
      />
    </>
  ),
  viewBox: '0 0 18 18',
});

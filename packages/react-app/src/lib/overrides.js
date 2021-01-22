const OWLTokenOverride = {
  100: {
    mediator: '0xbeD794745e2a0543eE609795ade87A55Bbe935Ba',
    from: '0x0905Ab807F8FD040255F0cF8fa14756c1D824931',
    to: '0x1a5f9352af8af974bfc03399e3767df6370d82e4',
    mode: 'erc677',
  },
  1: {
    mediator: '0xed7e6720Ac8525Ac1AEee710f08789D02cD87ecB',
    from: '0x1a5f9352af8af974bfc03399e3767df6370d82e4',
    to: '0x0905Ab807F8FD040255F0cF8fa14756c1D824931',
    mode: 'dedicated-erc20',
  },
};

const LINKTokenOverride = {
  100: {
    mediator: '0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d',
    from: '0xE2e73A1c69ecF83F464EFCE6A5be353a37cA09b2',
    to: '0x514910771af9ca656af840dff83e8264ecf986ca',
    mode: 'erc677',
  },
  1: {
    mediator: '0x88ad09518695c6c3712AC10a214bE5109a655671',
    from: '0x514910771af9ca656af840dff83e8264ecf986ca',
    to: '0xE2e73A1c69ecF83F464EFCE6A5be353a37cA09b2',
    mode: 'erc677',
  },
};

const STAKETokenOverride = {
  100: {
    mediator: '0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d',
    from: '0xb7D311E2Eb55F2f68a9440da38e7989210b9A05e',
    to: '0x0Ae055097C6d159879521C384F1D2123D1f195e6',
    mode: 'erc677',
  },
  1: {
    mediator: '0x88ad09518695c6c3712AC10a214bE5109a655671',
    from: '0x0Ae055097C6d159879521C384F1D2123D1f195e6',
    to: '0xb7D311E2Eb55F2f68a9440da38e7989210b9A05e',
    mode: 'erc677',
  },
};

const overrides = {
  ['0x0905Ab807F8FD040255F0cF8fa14756c1D824931'.toLowerCase()]: OWLTokenOverride,
  ['0x1a5f9352af8af974bfc03399e3767df6370d82e4'.toLowerCase()]: OWLTokenOverride,
  ['0xE2e73A1c69ecF83F464EFCE6A5be353a37cA09b2'.toLowerCase()]: LINKTokenOverride,
  ['0x514910771af9ca656af840dff83e8264ecf986ca'.toLowerCase()]: LINKTokenOverride,
  ['0x0Ae055097C6d159879521C384F1D2123D1f195e6'.toLowerCase()]: STAKETokenOverride,
  ['0xb7D311E2Eb55F2f68a9440da38e7989210b9A05e'.toLowerCase()]: STAKETokenOverride,
};

export const isOverridden = tokenAddress =>
  tokenAddress
    ? Object.keys(overrides).indexOf(tokenAddress.toLowerCase()) !== -1
    : false;

export const getOverriddenToToken = (tokenAddress, chainId) =>
  overrides[tokenAddress.toLowerCase()][chainId].to;

export const getOverriddenMode = (tokenAddress, chainId) =>
  overrides[tokenAddress.toLowerCase()][chainId].mode;

export const getOverriddenMediator = (tokenAddress, chainId) =>
  overrides[tokenAddress.toLowerCase()][chainId].mediator;

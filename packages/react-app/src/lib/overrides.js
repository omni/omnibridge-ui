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

const overrides = {
  '0x0905Ab807F8FD040255F0cF8fa14756c1D824931': OWLTokenOverride,
  '0x1a5f9352af8af974bfc03399e3767df6370d82e4': OWLTokenOverride,
  '0xE2e73A1c69ecF83F464EFCE6A5be353a37cA09b2': LINKTokenOverride,
  '0x514910771af9ca656af840dff83e8264ecf986ca': LINKTokenOverride,
};

export const isOverridden = tokenAddress =>
  Object.keys(overrides).indexOf(tokenAddress) !== -1;

export const getOverriddenToToken = (tokenAddress, chainId) =>
  overrides[tokenAddress][chainId].to;

export const getOverriddenMediator = (tokenAddress, chainId) =>
  overrides[tokenAddress][chainId].mediator;

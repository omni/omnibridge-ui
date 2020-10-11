const OWLTokenOverride = {
  100: {
    mediator: '0xbeD794745e2a0543eE609795ade87A55Bbe935Ba',
    from: '0x0905Ab807F8FD040255F0cF8fa14756c1D824931',
    to: '0x1a5f9352af8af974bfc03399e3767df6370d82e4',
  },
  1: {
    mediator: '0xed7e6720Ac8525Ac1AEee710f08789D02cD87ecB',
    from: '0x1a5f9352af8af974bfc03399e3767df6370d82e4',
    to: '0x0905Ab807F8FD040255F0cF8fa14756c1D824931',
  },
};

const overrides = {
  '0x0905Ab807F8FD040255F0cF8fa14756c1D824931': OWLTokenOverride,
  '0x1a5f9352af8af974bfc03399e3767df6370d82e4': OWLTokenOverride,
};

export const isOverridden = tokenAddress =>
  Object.keys(overrides).indexOf(tokenAddress) !== -1;

export const getOverriddenToToken = (tokenAddress, chainId) =>
  overrides[tokenAddress][chainId].to;

export const getOverriddenMediator = (tokenAddress, chainId) =>
  overrides[tokenAddress][chainId].mediator;

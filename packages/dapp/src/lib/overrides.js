import {
  BSC_XDAI_BRIDGE,
  ETH_BSC_BRIDGE,
  ETH_XDAI_BRIDGE,
  KOVAN_SOKOL_BRIDGE,
} from 'lib/networks';

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

const STAKETokenOverrideSokol = {
  77: {
    mediator: '0x40CdfF886715A4012fAD0219D15C98bB149AeF0e',
    from: '0x408ec1bb883da0ea0fb3c955ea6befcd05aa7c3a',
    to: '0xFD2df5dCe4c89B007A43CF88d8161dAf1A17C7AB',
    mode: 'erc677',
  },
  42: {
    mediator: '0xA960d095470f7509955d5402e36d9DB984B5C8E2',
    from: '0xFD2df5dCe4c89B007A43CF88d8161dAf1A17C7AB',
    to: '0x408ec1bb883da0ea0fb3c955ea6befcd05aa7c3a',
    mode: 'erc677',
  },
};

const MOONTokenOverride = {
  100: {
    mediator: '0xF75C28fE07E0647B05160288F172ad27CccD8f30',
    from: '0x1e16aa4Df73d29C029d94CeDa3e3114EC191E25A',
    to: '0xe1cA72ff3434B131765c62Cbcbc26060F7Aba03D',
    mode: 'erc677',
  },
  1: {
    mediator: '0xE7228B4EBAD37Ba031a8b63473727f991e262dCd',
    from: '0xe1cA72ff3434B131765c62Cbcbc26060F7Aba03D',
    to: '0x1e16aa4Df73d29C029d94CeDa3e3114EC191E25A',
    mode: 'erc677',
  },
};

const DEMO2712TokenOverrideSokol = {
  77: {
    mediator: '0x2a5fc52d8A563B2F181c6A527D422e1592C9ecFa',
    from: '0xd846B096949E15b42ABCaEB82137c5a3495B1Ed4',
    to: '0xa4764045851F17AA60B6c8E8b62072Bea9538521',
    mode: 'dedicated-erc20',
  },
  42: {
    mediator: '0xA68Bd659A9167F3D3C01bA9776A1208dae8F003b',
    from: '0xa4764045851F17AA60B6c8E8b62072Bea9538521',
    to: '0xd846B096949E15b42ABCaEB82137c5a3495B1Ed4',
    mode: 'erc677',
  },
};

const HNYTokenOverride = {
  100: {
    mediator: '0x0EeAcdb0Dd96588711581C5f3173dD55841b8e91',
    from: '0x71850b7e9ee3f13ab46d67167341e4bdc905eef9',
    to: '0xc3589f56b6869824804a5ea29f2c9886af1b0fce',
    mode: 'dedicated-erc20',
  },
  1: {
    mediator: '0x81A4833B3A40E7c61eFE9D1a287343797993B1E8',
    from: '0xc3589f56b6869824804a5ea29f2c9886af1b0fce',
    to: '0x71850b7e9ee3f13ab46d67167341e4bdc905eef9',
    mode: 'erc677',
  },
};

const DATATokenOverride = {
  100: {
    mediator: '0x7d55f9981d4E10A193314E001b96f72FCc901e40',
    from: '0xE4a2620edE1058D61BEe5F45F6414314fdf10548',
    to: '0x0cf0ee63788a0849fe5297f3407f701e122cc023',
    mode: 'dedicated-erc20',
  },
  1: {
    mediator: '0x2eeeDdeECe91c9F4c5bA4C8E1d784A0234C6d015',
    from: '0x0cf0ee63788a0849fe5297f3407f701e122cc023',
    to: '0xE4a2620edE1058D61BEe5F45F6414314fdf10548',
    mode: 'dedicated-erc20',
  },
};

const AGVETokenOverride = {
  100: {
    mediator: '0xBE20F60339b06Db32C319d46cf3Bc9bAcC0694aB',
    from: '0x3a97704a1b25f08aa230ae53b352e2e72ef52843',
    to: '0x0b006E475620Af076915257C6A9E40635AbdBBAd',
    mode: 'dedicated-erc20',
  },
  1: {
    mediator: '0x5689C65cfe5E8BF1A5F836c956DeA1b3B8BE00Bb',
    from: '0x0b006E475620Af076915257C6A9E40635AbdBBAd',
    to: '0x3a97704a1b25f08aa230ae53b352e2e72ef52843',
    mode: 'erc677',
  },
};

const ETH_XDAI_OVERRIDES = {
  ['0x0905Ab807F8FD040255F0cF8fa14756c1D824931'.toLowerCase()]: OWLTokenOverride,
  ['0x1a5f9352af8af974bfc03399e3767df6370d82e4'.toLowerCase()]: OWLTokenOverride,
  ['0xE2e73A1c69ecF83F464EFCE6A5be353a37cA09b2'.toLowerCase()]: LINKTokenOverride,
  ['0x514910771af9ca656af840dff83e8264ecf986ca'.toLowerCase()]: LINKTokenOverride,
  ['0x0Ae055097C6d159879521C384F1D2123D1f195e6'.toLowerCase()]: STAKETokenOverride,
  ['0xb7D311E2Eb55F2f68a9440da38e7989210b9A05e'.toLowerCase()]: STAKETokenOverride,
  ['0xFD2df5dCe4c89B007A43CF88d8161dAf1A17C7AB'.toLowerCase()]: STAKETokenOverrideSokol,
  ['0x408ec1bb883da0ea0fb3c955ea6befcd05aa7c3a'.toLowerCase()]: STAKETokenOverrideSokol,
  ['0xe1cA72ff3434B131765c62Cbcbc26060F7Aba03D'.toLowerCase()]: MOONTokenOverride,
  ['0x1e16aa4Df73d29C029d94CeDa3e3114EC191E25A'.toLowerCase()]: MOONTokenOverride,
  ['0xc3589f56b6869824804a5ea29f2c9886af1b0fce'.toLowerCase()]: HNYTokenOverride,
  ['0x71850b7e9ee3f13ab46d67167341e4bdc905eef9'.toLowerCase()]: HNYTokenOverride,
  ['0x0cf0ee63788a0849fe5297f3407f701e122cc023'.toLowerCase()]: DATATokenOverride,
  ['0xE4a2620edE1058D61BEe5F45F6414314fdf10548'.toLowerCase()]: DATATokenOverride,
  ['0x0b006E475620Af076915257C6A9E40635AbdBBAd'.toLowerCase()]: AGVETokenOverride,
  ['0x3a97704a1b25f08aa230ae53b352e2e72ef52843'.toLowerCase()]: AGVETokenOverride,
};

const KOVAN_SOKOL_OVERRIDES = {
  ['0xd846B096949E15b42ABCaEB82137c5a3495B1Ed4'.toLowerCase()]:
    DEMO2712TokenOverrideSokol,
  ['0xa4764045851F17AA60B6c8E8b62072Bea9538521'.toLowerCase()]:
    DEMO2712TokenOverrideSokol,
};

const BSC_XDAI_OVERRIDES = {};
const ETH_BSC_OVERRIDES = {};

const OVERRIDES = {
  [ETH_XDAI_BRIDGE]: ETH_XDAI_OVERRIDES,
  [KOVAN_SOKOL_BRIDGE]: KOVAN_SOKOL_OVERRIDES,
  [BSC_XDAI_BRIDGE]: BSC_XDAI_OVERRIDES,
  [ETH_BSC_BRIDGE]: ETH_BSC_OVERRIDES,
};

export const isOverridden = (bridgeDirection, token) => {
  if (!token || !bridgeDirection) return false;
  const { address, chainId } = token;
  if (!address || !chainId) return false;
  const overrides = OVERRIDES[bridgeDirection];
  const override = overrides[address.toLowerCase()];
  return override !== undefined && override[chainId] !== undefined;
};

export const getOverriddenToToken = (bridgeDirection, token) => {
  if (!token || !bridgeDirection) return null;
  const { address, chainId } = token;
  if (!address || !chainId) return null;
  const overrides = OVERRIDES[bridgeDirection];
  return overrides[address.toLowerCase()][chainId].to;
};

export const getOverriddenMode = (bridgeDirection, token) => {
  if (!token || !bridgeDirection) return null;
  const { address, chainId } = token;
  if (!address || !chainId) return null;
  const overrides = OVERRIDES[bridgeDirection];
  return overrides[address.toLowerCase()][chainId].mode;
};

export const getOverriddenMediator = (bridgeDirection, token) => {
  if (!token || !bridgeDirection) return null;
  const { address, chainId } = token;
  if (!address || !chainId) return null;
  const overrides = OVERRIDES[bridgeDirection];
  return overrides[address.toLowerCase()][chainId].mediator.toLowerCase();
};

const ETH_REBASING_TOKENS = [
  '0xd46ba6d942050d489dbd938a2c909a5d5039a161'.toLowerCase(),
  '0x798d1be841a82a273720ce31c822c61a67a601c3'.toLowerCase(),
  '0x1c7bbadc81e18f7177a95eb1593e5f5f35861b10'.toLowerCase(),
  '0x67c597624b17b16fb77959217360b7cd18284253'.toLowerCase(),
  '0x68a118ef45063051eac49c7e647ce5ace48a68a5'.toLowerCase(),
  '0x68a118ef45063051eac49c7e647ce5ace48a68a5'.toLowerCase(),
  '0xe8b251822d003a2b2466ee0e38391c2db2048739'.toLowerCase(),
  '0x233d91a0713155003fc4dce0afa871b508b3b715'.toLowerCase(),
  '0x07150e919b4de5fd6a63de1f9384828396f25fdc'.toLowerCase(),
  '0x05462671c05adc39a6521fa60d5e9443e9e9d2b9'.toLowerCase(),
  '0xecbf566944250dde88322581024e611419715f7a'.toLowerCase(),
  '0x9248c485b0b80f76da451f167a8db30f33c70907'.toLowerCase(),
  '0x3936ad01cf109a36489d93cabda11cf062fd3d48'.toLowerCase(),
  '0x2f6081e3552b1c86ce4479b80062a1dda8ef23e3'.toLowerCase(),
  '0xe17f017475a709de58e976081eb916081ff4c9d5'.toLowerCase(),
  '0x87f5f9ebe40786d49d35e1b5997b07ccaa8adbff'.toLowerCase(),
  '0x98ad9b32dd10f8d8486927d846d4df8baf39abe2'.toLowerCase(),
  '0x7777770f8a6632ff043c8833310e245eba9209e6'.toLowerCase(),
  '0x3fa807b6f8d4c407e6e605368f4372d14658b38c'.toLowerCase(),
  '0x10bae51262490b4f4af41e12ed52a0e744c1137a'.toLowerCase(),
  '0xac6fe9aa6b996d15f23e2e9a384fe64607bba7d5'.toLowerCase(),
  '0x15e4132dcd932e8990e794d1300011a472819cbd'.toLowerCase(),
  '0x5166d4ce79b9bf7df477da110c560ce3045aa889'.toLowerCase(),
  '0xf911a7ec46a2c6fa49193212fe4a2a9b95851c27'.toLowerCase(),
];

const ETH_INFLATIONARY_TOKENS = [
  '0xae7ab96520de3a18e5e111b5eaab095312d7fe84'.toLowerCase(),
  '0xdfe66b14d37c77f4e9b180ceb433d1b164f0281d'.toLowerCase(),
  '0xe95a203b1a91a908f9b9ce46459d101078c2c3cb'.toLowerCase(),
  '0xcbc1065255cbc3ab41a6868c22d1f1c573ab89fd'.toLowerCase(),
];

const BSC_REBASING_TOKENS = [
  '0x233d91a0713155003fc4dce0afa871b508b3b715'.toLowerCase(),
];

const BSC_INFLATIONARY_TOKENS = [
  '0x250632378e573c6be1ac2f97fcdf00515d0aa91b'.toLowerCase(),
];

export const isRebasingToken = (chainId, tokenAddress) => {
  if (!chainId || !tokenAddress) return false;
  switch (chainId) {
    case 100:
    case 77:
    case 42:
      return false;
    case 56:
      return BSC_REBASING_TOKENS.includes(tokenAddress.toLowerCase());
    case 1:
    default:
      return ETH_REBASING_TOKENS.includes(tokenAddress.toLowerCase());
  }
};

export const isInflationaryToken = (chainId, tokenAddress) => {
  if (!chainId || !tokenAddress) return false;
  switch (chainId) {
    case 100:
    case 77:
    case 42:
      return false;
    case 56:
      return BSC_INFLATIONARY_TOKENS.includes(tokenAddress.toLowerCase());
    case 1:
    default:
      return ETH_INFLATIONARY_TOKENS.includes(tokenAddress.toLowerCase());
  }
};

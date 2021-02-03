import { Address, TypedMap, log, dataSource } from '@graphprotocol/graph-ts';

import { Token } from '../types/Omnibridge/Token';
import { Token as TokenEntity } from '../types/schema';

class TokenObject {
  address: Address;
  name: string;
  symbol: string;
  decimals: i32;
}

function getOverrides(): TypedMap<Address, boolean> {
  let overridenTokens = new TypedMap<Address, boolean>();

  // **** OVERRIDES START ****
  overridenTokens.set(
    // xdai OWL
    Address.fromString('0x0905Ab807F8FD040255F0cF8fa14756c1D824931'),
    true,
  );
  overridenTokens.set(
    // mainnet OWL
    Address.fromString('0x1a5f9352af8af974bfc03399e3767df6370d82e4'),
    true,
  );
  overridenTokens.set(
    // xdai MOON
    Address.fromString('0x1e16aa4Df73d29C029d94CeDa3e3114EC191E25A'),
    true,
  );
  overridenTokens.set(
    // mainnet MOON
    Address.fromString('0xe1cA72ff3434B131765c62Cbcbc26060F7Aba03D'),
    true,
  );
  overridenTokens.set(
    // sokol DEMO2712
    Address.fromString('0xd846B096949E15b42ABCaEB82137c5a3495B1Ed4'),
    true,
  );
  overridenTokens.set(
    // kovan DEMO2712
    Address.fromString('0xa4764045851F17AA60B6c8E8b62072Bea9538521'),
    true,
  );
  overridenTokens.set(
    // xdai HNY
    Address.fromString('0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9'),
    true,
  );
  overridenTokens.set(
    // mainnet HNY
    Address.fromString('0xc3589F56B6869824804A5EA29F2c9886Af1B0FcE'),
    true,
  );
  // **** OVERRIDES END ****

  return overridenTokens;
}

export var overrides = getOverrides();

export function fetchTokenInfo(address: Address): TokenObject {
  let tokenInstance = Token.bind(address);
  log.debug('TokenContract at {}', [address.toHex()]);
  let tokenObject = new TokenObject();
  tokenObject.address = address;

  let name = tokenInstance.try_name();
  let symbol = tokenInstance.try_symbol();
  let decimals = tokenInstance.try_decimals();

  if (!name.reverted) {
    tokenObject.name = name.value;
  }

  if (!symbol.reverted) {
    tokenObject.symbol = symbol.value;
  }

  if (!decimals.reverted) {
    tokenObject.decimals = decimals.value;
  }

  return tokenObject;
}

function getMediatedTokens(): TypedMap<Address, Address> {
  let mediatedTokens = new TypedMap<Address, Address>();

  // **** OVERRIDES START ****
  mediatedTokens.set(
    // xdai OWL
    Address.fromString('0xbeD794745e2a0543eE609795ade87A55Bbe935Ba'),
    Address.fromString('0x0905Ab807F8FD040255F0cF8fa14756c1D824931'),
  );
  mediatedTokens.set(
    // mainnet OWL
    Address.fromString('0xed7e6720Ac8525Ac1AEee710f08789D02cD87ecB'),
    Address.fromString('0x1a5f9352af8af974bfc03399e3767df6370d82e4'),
  );
  mediatedTokens.set(
    // xdai MOON
    Address.fromString('0xF75C28fE07E0647B05160288F172ad27CccD8f30'),
    Address.fromString('0x1e16aa4Df73d29C029d94CeDa3e3114EC191E25A'),
  );
  mediatedTokens.set(
    // mainnet MOON
    Address.fromString('0xE7228B4EBAD37Ba031a8b63473727f991e262dCd'),
    Address.fromString('0xe1cA72ff3434B131765c62Cbcbc26060F7Aba03D'),
  );
  mediatedTokens.set(
    // sokol DEMO2712
    Address.fromString('0x2a5fc52d8A563B2F181c6A527D422e1592C9ecFa'),
    Address.fromString('0xd846B096949E15b42ABCaEB82137c5a3495B1Ed4'),
  );
  mediatedTokens.set(
    // kovan DEMO2712
    Address.fromString('0xA68Bd659A9167F3D3C01bA9776A1208dae8F003b'),
    Address.fromString('0xa4764045851F17AA60B6c8E8b62072Bea9538521'),
  );
  mediatedTokens.set(
    // xdai HNY
    Address.fromString('0x0EeAcdb0Dd96588711581C5f3173dD55841b8e91'),
    Address.fromString('0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9'),
  );
  mediatedTokens.set(
    // mainnet HNY
    Address.fromString('0x81A4833B3A40E7c61eFE9D1a287343797993B1E8'),
    Address.fromString('0xc3589F56B6869824804A5EA29F2c9886Af1B0FcE'),
  );
  // **** OVERRIDES END ****

  return mediatedTokens;
}

export var mediatedTokens = getMediatedTokens();

export function fetchMediatedTokenInfo(mediator: Address): TokenObject {
  return fetchTokenInfo(mediatedTokens.get(mediator));
}

export function updateHomeToken(tokenAddress: Address): void {
  let token = TokenEntity.load(tokenAddress.toHexString());
  if (token == null) {
    let tokenInfo = fetchTokenInfo(tokenAddress);
    updateHomeTokenInfo(tokenAddress, tokenInfo);
  }
}

export function updateHomeTokenInfo(
  tokenAddress: Address,
  tokenObject: TokenObject,
): void {
  let token = TokenEntity.load(tokenAddress.toHexString());
  if (token == null) {
    let token = new TokenEntity(tokenAddress.toHexString());
    token.homeAddress = tokenAddress;

    token.symbol = tokenObject.symbol;
    token.decimals = tokenObject.decimals;

    let network = dataSource.network();
    if (network == 'xdai') {
      token.homeChainId = 100;
      token.homeName = tokenObject.name;
    } else if (network == 'poa-sokol') {
      token.homeChainId = 77;
      token.homeName = tokenObject.name;
    } else if (network == 'kovan') {
      token.homeChainId = 42;
      token.homeName = tokenObject.name;
    } else if (network == 'mainnet') {
      token.homeChainId = 1;
      token.homeName = tokenObject.name;
    }

    token.save();
    log.debug('New homeToken {} and foreignToken {}', [
      token.homeAddress.toHexString(),
      token.foreignAddress.toHexString(),
    ]);
  }
}

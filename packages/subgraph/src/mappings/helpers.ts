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
  let overrides = new TypedMap<Address, boolean>();

  // **** OVERRIDES START ****
  overrides.set(
    // xdai OWL
    Address.fromString('0x0905Ab807F8FD040255F0cF8fa14756c1D824931'),
    true,
  );
  overrides.set(
    // mainnet OWL
    Address.fromString('0x1a5f9352af8af974bfc03399e3767df6370d82e4'),
    true,
  );
  overrides.set(
    // xdai MOON
    Address.fromString('0x1e16aa4Df73d29C029d94CeDa3e3114EC191E25A'),
    true,
  );
  overrides.set(
    // mainnet MOON
    Address.fromString('0x1e16aa4Df73d29C029d94CeDa3e3114EC191E25A'),
    true,
  );
  overrides.set(
    // sokol DEMO2712
    Address.fromString('0xd846B096949E15b42ABCaEB82137c5a3495B1Ed4'),
    true,
  );
  overrides.set(
    // kovan DEMO2712
    Address.fromString('0xa4764045851F17AA60B6c8E8b62072Bea9538521'),
    true,
  );
  // **** OVERRIDES END ****

  return overrides;
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
    Address.fromString('0x1e16aa4Df73d29C029d94CeDa3e3114EC191E25A'),
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

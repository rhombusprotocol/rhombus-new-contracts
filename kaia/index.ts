import { eKaiaNetwork, IAaveConfiguration } from '../../helpers/types';
import { AaveMarket } from '../aave/index';
import { ZERO_ADDRESS } from '../../helpers/constants';
import { strategyDAI, strategyWETH, strategyUSDT } from '../aave/reservesConfigs';
import {
  strategyLINK,
  strategyWAVAX,
  strategyAAVE,
  strategyWBTC,
  strategyWKAIA,
  strategyUSDT_Wormhole,
  strategyUSDC_Wormhole,
} from './reservesConfigs';

// ----------------
// POOL--SPECIFIC PARAMS
// ----------------

export const KAIAMarket: IAaveConfiguration = {
  ...AaveMarket,
  ProviderId: 8217,
  WrappedNativeTokenSymbol: 'WKLAY',
  MarketId: 'KAIA Rhombus Market',
  ATokenNamePrefix: 'tt',
  StableDebtTokenNamePrefix: 'tt',
  VariableDebtTokenNamePrefix: 'tt',
  SymbolPrefix: 'tt',
  ReservesConfig: {
    WKLAY: strategyWKAIA,
    'USDT(Wormhole)': strategyUSDT_Wormhole,
    'USDC(Wormhole)': strategyUSDC_Wormhole,
    'WETH(Wormhole)': strategyWETH,
    // DAI: strategyDAI,
    // LINK: strategyLINK,
    // USDC: strategyUSDC,
    // WBTC: strategyWBTC,
    // WETH: strategyWETH,
    // USDT: strategyUSDT,
    // AAVE: strategyAAVE,
    // WAVAX: strategyWAVAX,
  },
  ReserveAssets: {
    [eKaiaNetwork.kaia]: {
      WKLAY: '0x19aac5f612f524b754ca7e7c41cbfa2e981a4432',
      'USDT(Wormhole)': '0x5c13e303a62fc5dedf5b52d66873f2e59fedadc2',
      'USDC(Wormhole)': '0x608792deb376cce1c9fa4d0e6b7b44f507cffa6a',
      'WETH(Wormhole)': '0x98a8345bb9d3dda9d808ca1c9142a28f6b0430e1',
      // DAI: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
      // LINK: '0x5947BB275c521040051D82396192181b413227A3',
      // USDC: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
      // WBTC: '0x50b7545627a5162F82A992c33b87aDc75187B218',
      // WETH: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
      // USDT: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
      // AAVE: '0x63a72806098Bd3D9520cC43356dD78afe5D386D9',
      // WAVAX: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7',
    },
  },
  ChainlinkAggregator: {
    [eKaiaNetwork.kaia]: {
      WKLAY: '0x6a08d36e8c10d5d89529c7443cebf37ea2cd01d4',
      'USDT(Wormhole)': ZERO_ADDRESS,
      'USDC(Wormhole)': '0x2a6c17ec5639d495e78bfb0be145b8d575bc9bf2',
      'WETH(Wormhole)': '0xbf61f1f8d45ecb33006a335e7c76f306689dcaab',
      // DAI: '0x51D7180edA2260cc4F6e4EebB82FEF5c3c2B8300',
      // LINK: '0x49ccd9ca821EfEab2b98c60dC60F518E765EDe9a',
      // USDC: '0xF096872672F44d6EBA71458D74fe67F9a77a23B9',
      // WBTC: '0x2779D32d5166BAaa2B2b658333bA7e6Ec0C65743',
      // WETH: '0x976B3D034E162d8bD72D6b9C989d545b839003b0',
      // USDT: '0xEBE676ee90Fe1112671f19b6B7459bC678B67e8a',
      // AAVE: '0x3CA13391E9fb38a75330fb28f8cc2eB3D9ceceED',
      // WAVAX: '0x0A77230d17318075983913bC2145DB16C7366156',
    },
  },
  EModes: {
    StableEMode: {
      id: '1',
      ltv: '9700',
      liquidationThreshold: '9750',
      liquidationBonus: '10100',
      label: 'Stablecoins',
      assets: ['USDC(Wormhole)', 'USDT(Wormhole)'],
    },
  },
  BaseCurrency: {
    [eKaiaNetwork.kaia]: '0x5c13e303a62fc5dedf5b52d66873f2e59fedadc2', // wormhole usdt
  },
};

export default KAIAMarket;

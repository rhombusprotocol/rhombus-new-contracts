import {
  DETERMINISTIC_DEPLOYMENT,
  DETERMINISTIC_FACTORIES,
  ETHERSCAN_KEY,
  getCommonNetworkConfig,
  hardhatNetworkSettings,
  loadTasks,
} from './helpers/hardhat-config-helpers';
import {
  eArbitrumNetwork,
  eAvalancheNetwork,
  eEthereumNetwork,
  eFantomNetwork,
  eHarmonyNetwork,
  eOptimismNetwork,
  ePolygonNetwork,
  eBaseNetwork,
  eKaiaNetwork,
  eKairosNetwork,
} from './helpers/types';
import { DEFAULT_NAMED_ACCOUNTS } from './helpers/constants';

import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-deploy';
import 'hardhat-contract-sizer';
import 'hardhat-dependency-compiler';
import '@nomicfoundation/hardhat-chai-matchers';
import '@nomiclabs/hardhat-etherscan';

const SKIP_LOAD = process.env.SKIP_LOAD === 'true';
const TASK_FOLDERS = ['misc', 'market-registry'];

// Prevent to load tasks before compilation and typechain
if (!SKIP_LOAD) {
  loadTasks(TASK_FOLDERS);
}

export default {
  contractSizer: {
    alphaSort: true,
    runOnCompile: false,
    disambiguatePaths: false,
  },
  solidity: {
    compilers: [
      {
        version: '0.8.10',
        settings: {
          optimizer: { enabled: true, runs: 100_000 },
          evmVersion: 'berlin',
        },
      },
      {
        version: '0.7.5',
        settings: {
          optimizer: { enabled: true, runs: 100_000 },
        },
      },
    ],
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },
  networks: {
    hardhat: hardhatNetworkSettings,
    localhost: {
      url: 'http://127.0.0.1:8545',
      ...hardhatNetworkSettings,
    },
    tenderly: getCommonNetworkConfig('tenderly', 1),
    main: getCommonNetworkConfig(eEthereumNetwork.main, 1),
    kovan: getCommonNetworkConfig(eEthereumNetwork.kovan, 42),
    rinkeby: getCommonNetworkConfig(eEthereumNetwork.rinkeby, 4),
    ropsten: getCommonNetworkConfig(eEthereumNetwork.ropsten, 3),
    [ePolygonNetwork.polygon]: getCommonNetworkConfig(ePolygonNetwork.polygon, 137),
    [ePolygonNetwork.mumbai]: getCommonNetworkConfig(ePolygonNetwork.mumbai, 80001),
    arbitrum: getCommonNetworkConfig(eArbitrumNetwork.arbitrum, 42161),
    [eArbitrumNetwork.arbitrumTestnet]: getCommonNetworkConfig(eArbitrumNetwork.arbitrumTestnet, 421611),
    [eHarmonyNetwork.main]: getCommonNetworkConfig(eHarmonyNetwork.main, 1666600000),
    [eHarmonyNetwork.testnet]: getCommonNetworkConfig(eHarmonyNetwork.testnet, 1666700000),
    [eAvalancheNetwork.avalanche]: getCommonNetworkConfig(eAvalancheNetwork.avalanche, 43114),
    [eAvalancheNetwork.fuji]: getCommonNetworkConfig(eAvalancheNetwork.fuji, 43113),
    [eFantomNetwork.main]: getCommonNetworkConfig(eFantomNetwork.main, 250),
    [eFantomNetwork.testnet]: getCommonNetworkConfig(eFantomNetwork.testnet, 4002),
    [eOptimismNetwork.testnet]: getCommonNetworkConfig(eOptimismNetwork.testnet, 420),
    [eOptimismNetwork.main]: getCommonNetworkConfig(eOptimismNetwork.main, 10),
    [eEthereumNetwork.goerli]: getCommonNetworkConfig(eEthereumNetwork.goerli, 5),
    [eEthereumNetwork.sepolia]: getCommonNetworkConfig(eEthereumNetwork.sepolia, 11155111),
    [eArbitrumNetwork.goerliNitro]: getCommonNetworkConfig(eArbitrumNetwork.goerliNitro, 421613),
    [eBaseNetwork.base]: getCommonNetworkConfig(eBaseNetwork.base, 8453),
    [eBaseNetwork.baseGoerli]: getCommonNetworkConfig(eBaseNetwork.baseGoerli, 84531),
    [eKaiaNetwork.kaia]: getCommonNetworkConfig(eKaiaNetwork.kaia, 8217),
    [eKairosNetwork.kairos]: getCommonNetworkConfig(eKairosNetwork.kairos, 1001),
  },
  namedAccounts: {
    ...DEFAULT_NAMED_ACCOUNTS,
  },
  mocha: {
    timeout: 0,
  },

  deterministicDeployment: DETERMINISTIC_DEPLOYMENT ? DETERMINISTIC_FACTORIES : undefined,
  etherscan: {
    apiKey: ETHERSCAN_KEY,
    customChains: [
      {
        network: eBaseNetwork.base,
        chainId: 8453,
        urls: {
          apiURL: 'https://api.basescan.org/api',
          browserURL: 'https://basescan.org/',
        },
      },
    ],
  },
};

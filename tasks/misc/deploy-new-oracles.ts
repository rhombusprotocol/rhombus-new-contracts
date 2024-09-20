import { task } from 'hardhat/config';
import { getChainlinkOracles, getOracleByAsset } from '../../helpers/market-config-helpers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { COMMON_DEPLOY_PARAMS } from '../../helpers/env';
import { V3_CORE_VERSION, ZERO_ADDRESS } from '../../helpers/constants';
import { FALLBACK_ORACLE_ID, ORACLE_ID, POOL_ADDRESSES_PROVIDER_ID } from '../../helpers/deploy-ids';
import {
  loadPoolConfig,
  ConfigNames,
  getParamPerNetwork,
  checkRequiredEnvironment,
  getReserveAddresses,
} from '../../helpers/market-config-helpers';
import { eNetwork, ICommonConfiguration, SymbolMap } from '../../helpers/types';
import { getPairsTokenAggregator } from '../../helpers/init-helpers';
import { getAddress, parseUnits } from 'ethers/lib/utils';
import { MARKET_NAME } from '../../helpers/env';
import { PoolAddressesProvider } from '../../typechain';
import { getAaveOracle, getPriceOracle, waitForTx } from '../../helpers';
task(`deploy-new-oracles`, `Deploys new oracles`).setAction(async (_, hre) => {
  if (!hre.network.config.chainId) {
    throw new Error('INVALID_CHAIN_ID');
  }
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const poolConfig = await loadPoolConfig(MARKET_NAME as ConfigNames);
  const network = (process.env.FORK ? process.env.FORK : hre.network.name) as eNetwork;

  const { OracleQuoteUnit } = poolConfig as ICommonConfiguration;

  const { address: addressesProviderAddress } = await deployments.get(POOL_ADDRESSES_PROVIDER_ID);

  const fallbackOracleAddress = ZERO_ADDRESS;

  const reserveAssets = await getReserveAddresses(poolConfig, network);
  const chainlinkAggregators = await getChainlinkOracles(poolConfig, network);

  const [assets, sources] = getPairsTokenAggregator(reserveAssets, chainlinkAggregators);

  // Deploy AaveOracle
  await deploy(ORACLE_ID, {
    from: deployer,
    args: [addressesProviderAddress, assets, sources, fallbackOracleAddress, ZERO_ADDRESS, parseUnits('1', OracleQuoteUnit)],
    ...COMMON_DEPLOY_PARAMS,
    contract: 'AaveOracle',
  });
});

task(`setup-new-oracles`, `Setup new oracles`).setAction(async (_, hre) => {
  if (!hre.network.config.chainId) {
    throw new Error('INVALID_CHAIN_ID');
  }
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const addressesProviderArtifact = await deployments.get(POOL_ADDRESSES_PROVIDER_ID);
  const addressesProviderInstance = (
    await hre.ethers.getContractAt(addressesProviderArtifact.abi, addressesProviderArtifact.address)
  ).connect(await hre.ethers.getSigner(deployer)) as PoolAddressesProvider;

  // 1. Set price oracle
  const configPriceOracle = (await deployments.get(ORACLE_ID)).address;
  const statePriceOracle = await addressesProviderInstance.getPriceOracle();
  if (getAddress(configPriceOracle) === getAddress(statePriceOracle)) {
    console.log('[addresses-provider] Price oracle already set. Skipping tx.');
  } else {
    await waitForTx(await addressesProviderInstance.setPriceOracle(configPriceOracle));
    console.log(`[Deployment] Added PriceOracle ${configPriceOracle} to PoolAddressesProvider`);
  }

  return true;
});

task(`sync-oracles`, `Sync oracles`).setAction(async (_, hre) => {
  const poolConfig = await loadPoolConfig(MARKET_NAME as ConfigNames);
  const network = (process.env.FORK ? process.env.FORK : hre.network.name) as eNetwork;

  const { deployer } = await hre.getNamedAccounts();

  const reserveAssets = await getReserveAddresses(poolConfig, network);
  const chainlinkAggregators = await getChainlinkOracles(poolConfig, network);

  const [assets, sources] = getPairsTokenAggregator(reserveAssets, chainlinkAggregators);

  const mainOracle = await getAaveOracle();

  const signer = await hre.ethers.getSigner(deployer);

  waitForTx(await mainOracle.setAssetSources(assets, sources));
});

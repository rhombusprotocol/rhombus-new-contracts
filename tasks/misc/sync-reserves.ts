import { task } from 'hardhat/config';
import { getChainlinkOracles, savePoolTokens } from '../../helpers/market-config-helpers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { COMMON_DEPLOY_PARAMS } from '../../helpers/env';
import { V3_CORE_VERSION, ZERO_ADDRESS } from '../../helpers/constants';
import { FALLBACK_ORACLE_ID, ORACLE_ID, POOL_ADDRESSES_PROVIDER_ID, POOL_DATA_PROVIDER } from '../../helpers/deploy-ids';
import {
  loadPoolConfig,
  ConfigNames,
  getParamPerNetwork,
  checkRequiredEnvironment,
  getReserveAddresses,
} from '../../helpers/market-config-helpers';
import { eNetwork, IAaveConfiguration, ICommonConfiguration, SymbolMap } from '../../helpers/types';
import { configureReservesByHelper, getPairsTokenAggregator, initReservesByHelper } from '../../helpers/init-helpers';
import { getAddress, parseUnits } from 'ethers/lib/utils';
import { MARKET_NAME } from '../../helpers/env';
import { PoolAddressesProvider } from '../../typechain';
import { waitForTx } from '../../helpers';
task(`sync-reserves`, `Sync reserves`).setAction(async (_, hre) => {
  if (!hre.network.config.chainId) {
    throw new Error('INVALID_CHAIN_ID');
  }
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const poolConfig = (await loadPoolConfig(MARKET_NAME as ConfigNames)) as IAaveConfiguration;
  const addressProviderArtifact = await deployments.get(POOL_ADDRESSES_PROVIDER_ID);

  const network = (process.env.FORK ? process.env.FORK : hre.network.name) as eNetwork;
  const { ATokenNamePrefix, StableDebtTokenNamePrefix, VariableDebtTokenNamePrefix, SymbolPrefix, ReservesConfig, RateStrategies } =
    poolConfig;

  const treasuryAddress = deployer;
  const incentivesController = await deployments.get('IncentivesProxy');
  const reservesAddresses = await getReserveAddresses(poolConfig, network);

  if (Object.keys(reservesAddresses).length == 0) {
    console.warn('[WARNING] Skipping initialization. Empty asset list.');
    return;
  }

  await initReservesByHelper(
    ReservesConfig,
    reservesAddresses,
    ATokenNamePrefix,
    StableDebtTokenNamePrefix,
    VariableDebtTokenNamePrefix,
    SymbolPrefix,
    deployer,
    treasuryAddress,
    incentivesController.address
  );
  deployments.log(`[Deployment] Initialized all reserves`);

  await configureReservesByHelper(ReservesConfig, reservesAddresses);

  // Save AToken and Debt tokens artifacts
  const dataProvider = await deployments.get(POOL_DATA_PROVIDER);
  await savePoolTokens(reservesAddresses, dataProvider.address);

  deployments.log(`[Deployment] Configured all reserves`);
});

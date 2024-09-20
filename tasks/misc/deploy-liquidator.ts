import { deployContract } from '../../helpers/utilities/tx';
import { task } from 'hardhat/config';
import { chainlinkAggregatorProxy, chainlinkEthUsdAggregatorProxy } from '../../helpers/constants';
import { getPool, getPoolAddressesProvider } from '../../helpers';

task(`deploy-liquidator`, `Deploys the Liquidator contract`).setAction(async (_, hre) => {
  if (!hre.network.config.chainId) {
    throw new Error('INVALID_CHAIN_ID');
  }
  const addressProvider = await getPoolAddressesProvider();
  const artifact = await deployContract('Liquidator', [addressProvider.address], undefined, 'Liquidator');

  console.log('Liquidator:', artifact.address);
  console.log('Network:', hre.network.name);
});

task(`test-liquidation`, `Test the Liquidator contract`).setAction(async (_, hre) => {
  if (!hre.network.config.chainId) {
    throw new Error('INVALID_CHAIN_ID');
  }
  const addressProvider = await getPoolAddressesProvider();

  const { deployer } = await hre.getNamedAccounts();
  const signer = await hre.ethers.getSigner(deployer);

  const artifact = await hre.deployments.get('Liquidator');
  const liquidator = await hre.ethers.getContractAt('Liquidator', artifact.address, signer);

  const collateral = '0x043c471bee060e00a56ccd02c0ca286808a5a436';
  const debt = '0x69bF39AD777502d1d31b8DFcC08F96BB1195c693';
  const user = '0x2841D4b31083615F32AD0346E6321Ddfe9D63125';

  await liquidator.liquidate(collateral, debt, user, '0', false);
});

task(`test-liquidation-direct`, `Test the Liquidator contract`).setAction(async (_, hre) => {
  if (!hre.network.config.chainId) {
    throw new Error('INVALID_CHAIN_ID');
  }
  const addressProvider = await getPoolAddressesProvider();

  const { deployer } = await hre.getNamedAccounts();
  const signer = await hre.ethers.getSigner(deployer);

  const artifact = await hre.deployments.get('Liquidator');
  const liquidator = await hre.ethers.getContractAt('Liquidator', artifact.address, signer);

  const pool = await getPool();

  const collateral = '0x043c471bee060e00a56ccd02c0ca286808a5a436';
  const debt = '0x69bF39AD777502d1d31b8DFcC08F96BB1195c693';
  const user = '0x2841D4b31083615F32AD0346E6321Ddfe9D63125';

  const collateralArtifact = await hre.ethers.getContractAt('ERC20', collateral, signer);

  // const tx = await collateralArtifact.approve(pool.address, hre.ethers.constants.MaxUint256);

  // await tx.wait();

  await pool.liquidationCall(collateral, debt, user, '500000', false, {
    gasLimit: 5000000,
  });
});

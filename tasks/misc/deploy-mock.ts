import { deployContract } from '../../helpers/utilities/tx';
import { task } from 'hardhat/config';
import { chainlinkAggregatorProxy, chainlinkEthUsdAggregatorProxy } from '../../helpers/constants';
import { getPoolAddressesProvider } from '../../helpers';

task(`deploy-mock-token`, `Deploys the Liquidator contract`)
  .addParam('name', 'The name of the token')
  .addParam('symbol', 'The symbol of the token')
  .addParam('decimals', 'The decimals of the token')
  .setAction(async ({ name, symbol, decimals }, hre) => {
    if (!hre.network.config.chainId) {
      throw new Error('INVALID_CHAIN_ID');
    }
    const { deploy } = hre.deployments;
    const { deployer } = await hre.getNamedAccounts();
    const signer = await hre.ethers.getSigner(deployer);
    const ethers = hre.ethers;
    const addressProvider = await getPoolAddressesProvider();
    const artifact = await deploy('MOCK-' + symbol, {
      from: deployer,
      args: [name, symbol, decimals],
      contract: 'MintableERC20',
    });

    console.log(`Mock token: ${name} deployed at ${artifact.address}`);

    // intial mint

    const token = await hre.ethers.getContractAt('MintableERC20', artifact.address, signer);

    await token['mint(address,uint256)'](deployer, ethers.utils.parseUnits('1000000', decimals));
  });

task(`deploy-mock-aggregator`, `Deploys the Chainlink Aggregator contract`)
  .addParam('answer', 'The answer of the aggregator')
  .addParam('symbol', 'The symbol of the aggregator')
  .setAction(async ({ answer, symbol }, hre) => {
    if (!hre.network.config.chainId) {
      throw new Error('INVALID_CHAIN_ID');
    }
    const { deploy } = hre.deployments;
    const ethers = hre.ethers;

    const { deployer } = await hre.getNamedAccounts();
    const artifact = await deploy('MockAggregator' + symbol, {
      from: deployer,
      args: [ethers.utils.parseUnits(answer, 8)],
      contract: 'MockAggregator',
    });

    console.log(`Mock aggregator deployed at ${artifact.address}`);
  });

task(`update-mock-aggregator-value`, `Deploys the Chainlink Aggregator contract`)
  .addParam('answer', 'The answer of the aggregator')
  .addParam('symbol', 'The symbol of the aggregator')
  .setAction(async ({ answer, symbol }, hre) => {
    if (!hre.network.config.chainId) {
      throw new Error('INVALID_CHAIN_ID');
    }
    const { deploy } = hre.deployments;
    const ethers = hre.ethers;

    const { deployer } = await hre.getNamedAccounts();

    const artifact = await hre.deployments.get('MockAggregator' + symbol);

    const aggregator = await hre.ethers.getContractAt('MockAggregator', artifact.address, hre.ethers.provider.getSigner(deployer));

    await aggregator.updateAnswer(ethers.utils.parseUnits(answer, 8));
  });

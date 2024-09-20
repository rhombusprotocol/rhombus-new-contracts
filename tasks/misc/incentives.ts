import { task } from 'hardhat/config';
import {
  getFaucet,
  getWrappedTokenGateway,
  getPoolConfiguratorProxy,
  getEmissionManager,
  getIncentivesV2,
  getPullRewardsStrategy,
} from '../../helpers/contract-getters';
import { deployContract, waitForTx } from '../../helpers/utilities/tx';
import {
  ConfigNames,
  eKaiaNetwork,
  getOracleByAsset,
  INCENTIVES_PULL_REWARDS_STRATEGY_ID,
  loadPoolConfig,
  ZERO_ADDRESS,
} from '../../helpers';
import { COMMON_DEPLOY_PARAMS, MARKET_NAME } from '../../helpers/env';
import { parseUnits } from 'ethers/lib/utils';

task(`deploy-incentive-transfer-strategy`, `Deploys the incentive transfer strategy`).setAction(async ({}, hre) => {
  const { deployer } = await hre.getNamedAccounts();
  const { deployments } = hre;
  const { deploy } = deployments;
  const signer = await hre.ethers.getSigner(deployer);

  const emissionManager = await getEmissionManager();
  const incentiveProxy = await getIncentivesV2();

  const pullRewardsTransferStrategy = await deployContract(
    INCENTIVES_PULL_REWARDS_STRATEGY_ID,
    [incentiveProxy.address, emissionManager.address, incentiveProxy.address],
    undefined,
    INCENTIVES_PULL_REWARDS_STRATEGY_ID
  );

  console.log(`PullRewardsTransferStrategy deployed at ${pullRewardsTransferStrategy.address}`);
  //   const faucetContract = await getFaucet();

  //   const wrappedTokenGatewayV3 = await getWrappedTokenGateway();

  //   const wrappedTokenAddress = await wrappedTokenGatewayV3.getWETHAddress();

  //   console.log(`Faucet contract to disable minting for asset ${wrappedTokenAddress}`);

  //   await waitForTx(await faucetContract.connect(signer).setMintable(wrappedTokenAddress, false));

  //   console.log(`Faucet contract disabled minting for asset ${wrappedTokenAddress}`);

  //   const poolConfiguratorProxyContract = await getPoolConfiguratorProxy();

  //   console.log(`Update reserve for asset ${wrappedTokenAddress} to setReserveBorrowing to false`);

  //   await waitForTx(await poolConfiguratorProxyContract.connect(signer).setReserveBorrowing(wrappedTokenAddress, false));

  //   console.log(`Successfully updated reserve for asset ${wrappedTokenAddress} to setReserveBorrowing to false`);
});

task(`set-emission-admin`, `Sets the emission admin`)
  .addParam(`reward`, `The reward to set the emission admin for`)
  .addParam(`admin`, `The admin to set`)
  .setAction(async ({ reward, admin }, hre) => {
    const { deployer } = await hre.getNamedAccounts();
    const { deployments } = hre;
    const { deploy } = deployments;

    const signer = await hre.ethers.getSigner(deployer);

    const emissionManager = await getEmissionManager();

    const currentEmissionAdmin = await emissionManager.getEmissionAdmin(reward);

    console.log(`Current emission admin for reward ${reward} is ${currentEmissionAdmin}`);

    if (currentEmissionAdmin.toLowerCase() === admin.toLowerCase()) {
      console.log(`Emission admin for reward ${reward} is already set to ${admin}`);
      return;
    } else {
      console.log(`Setting emission admin for reward ${reward} to ${admin}`);
      await waitForTx(await emissionManager.setEmissionAdmin(reward, admin));
    }
  });

const rewardConfig: Record<
  string,
  {
    rewardSymbol: string;
    emissionPerSecond: string;
    distributionEnd: string;
    asset: string;
    reward: string;
    strategyType: string;
  }[]
> = {
  [eKaiaNetwork.kaia]: [
    {
      rewardSymbol: 'WKLAY',
      emissionPerSecond: parseUnits('0.01', 18).toString(),
      distributionEnd: '1726212878',
      asset: '0x848D81A771A359F7121BbE1315A38FD660Da0F07', // aToken or debtToken.
      reward: '0x19aac5f612f524b754ca7e7c41cbfa2e981a4432',
      strategyType: 'PullRewardsTransferStrategy',
    },
  ],
};

task(`set-reward-config`, `Sets the reward config`).setAction(async ({ reward, admin }, hre) => {
  const { deployer } = await hre.getNamedAccounts();
  const { deployments } = hre;
  const { deploy } = deployments;

  const signer = await hre.ethers.getSigner(deployer);
  const config = await loadPoolConfig(MARKET_NAME as ConfigNames);

  const emissionManager = await getEmissionManager();
  const networkName = hre.network.name;
  if (rewardConfig[networkName]) {
    const configInputs = [];
    for (const reward of rewardConfig[networkName]) {
      const oracle = await getOracleByAsset(config, reward.rewardSymbol);
      configInputs.push({
        emissionPerSecond: reward.emissionPerSecond,
        totalSupply: '0',
        distributionEnd: reward.distributionEnd,
        asset: reward.asset,
        reward: reward.reward,
        rewardOracle: oracle,
        transferStrategy: reward.strategyType === 'PullRewardsTransferStrategy' ? (await getPullRewardsStrategy()).address : ZERO_ADDRESS,
      });
      await hre.run('set-emission-admin', {
        reward: reward.reward,
        admin: deployer,
      });
    }

    console.log(configInputs);

    await waitForTx(await emissionManager.configureAssets(configInputs));
  } else {
    console.log(`No reward configuration found for network: ${networkName}`);
  }
});

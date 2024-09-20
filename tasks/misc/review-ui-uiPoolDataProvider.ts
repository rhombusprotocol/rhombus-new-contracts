import { getAaveOracle, getAToken, getPool, getPoolAddressesProvider, getUiPoolDataProvider } from '../../helpers/contract-getters';
import { POOL_ADDRESSES_PROVIDER_ID } from '../../helpers/deploy-ids';
import { getAddressFromJson } from '../../helpers/utilities/tx';
import { getAaveProtocolDataProvider } from '../../helpers/contract-getters';
import { task } from 'hardhat/config';
import { FORK } from '../../helpers/hardhat-config-helpers';

interface ATokenConfig {
  revision: string;
  name: string;
  symbol: string;
  decimals: string;
  treasury: string;
  incentives: string;
  pool: string;
  underlying: string;
}

task(`review-ui-uiPoolDataProvider`).setAction(async ({ log }, { deployments, getNamedAccounts, ...hre }) => {
  console.log('start review');
  const network = FORK ? FORK : hre.network.name;

  const poolAddressesProvider = await getPoolAddressesProvider(await getAddressFromJson(network, POOL_ADDRESSES_PROVIDER_ID));
  const oracleAddress = await poolAddressesProvider.getPriceOracle();
  console.log('oracleAddress', oracleAddress);
  const poolDataProvider = await poolAddressesProvider.getPoolDataProvider();
  console.log('poolDataProvider', poolDataProvider);
  const oracle = await getAaveOracle();
  const pool = await getPool();
  const uiDataProvider = await getUiPoolDataProvider();

  const reserves = await pool.getReservesList();

  for (const reserve of reserves) {
    const reserveData = await pool.getReserveData(reserve);
    console.log(reserveData);
    const oralcePrice = await oracle.getAssetPrice(reserve);
    console.log('oracle price', oralcePrice);
  }
});

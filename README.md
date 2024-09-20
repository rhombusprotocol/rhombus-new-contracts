# Rhombus Contarcts

Rhombus is money market protocol forked from aave-v3 with little changes.

### Changes

1. use `latestRoundData()`

aave-v3 uses `latestAnswer()` to fetch oracle price from chainlink aggregator. But there is no chainlink oracle in kaia network, so we use [orakl network](https://orakl.network/data-feed?network=Cypress) as oracle provider.
Every functions that use `latestAnswer()` are changed to `latestRoundData()`

```
### aave-v3 uses latestAnswer() for oracle getter.

   function getAssetPrice(address asset) public view override returns (uint256) {
      AggregatorInterface source = assetsSources[asset];

      if (asset == BASE_CURRENCY) {
      return BASE_CURRENCY_UNIT;
      } else if (address(source) == address(0)) {
      return _fallbackOracle.getAssetPrice(asset);
      } else {
        int256 price = source.latestAnswer();
         if (price > 0) {
            return uint256(price);
          } else {
            return _fallbackOracle.getAssetPrice(asset);
          }
      }
  }


### rhombus uses latestRoundData() provided by orakl

    function getAssetPrice(address asset) public view override returns (uint256) {
        AggregatorInterface source = assetsSources[asset];

        if (asset == BASE_CURRENCY) {
            return BASE_CURRENCY_UNIT;
        } else if (address(source) == address(0)) {
            return _fallbackOracle.getAssetPrice(asset);
        } else {
            (, int256 price,) = source.latestRoundData(); ## change
            if (price > 0) {
                return uint256(price);
            } else {
                return _fallbackOracle.getAssetPrice(asset);
            }
        }
    }
```

This Node.js repository contains the configuration and deployment scripts for the Aave V3 protocol core and periphery contracts. The repository makes use of `hardhat` and `hardhat-deploy` tools to facilitate the deployment of Aave V3 protocol.

## Folder structure

| Path                  | Description                                                          |
| --------------------- | -------------------------------------------------------------------- |
| contracts /           | Solidity Contracts directory                                         |
| deploy/               | Main deployment scripts dir location                                 |
| ├─ 00-core/           | Core deployment, only needed to run once per network.                |
| ├─ 01-periphery_pre/  | Periphery contracts deployment, only need to run once per network.   |
| ├─ 02-market/         | Market deployment scripts, depends of Core and Periphery deployment. |
| ├─ 03-periphery_post/ | Periphery contracts deployment after market is deployed.             |
| markets/              | Directory to configure Aave markets                                  |
| tasks/                | Hardhat tasks to setup and review market configs                     |
| helpers/              | Utility helpers to manage configs and deployments                    |

## License

Please be aware that [Aave V3](https://github.com/aave/aave-v3-core) is under [BSUL](https://github.com/aave/aave-v3-core/blob/master/LICENSE.md) license as of 27 January 2023 or date specified at v3-license-date.aave.eth. The Licensor hereby grants you the right to copy, modify, create derivative works, redistribute, and make non-production use of the Licensed Work. Any exceptions to this license may be specified by Aave governance. This repository containing the deployment scripts for the Aave V3 smart contracts can only be used for local or testing purposes. If you wish to deploy to a production environment you can reach out to Aave Governance [here](https://governance.aave.com/).

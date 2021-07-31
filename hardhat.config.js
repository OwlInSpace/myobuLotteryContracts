require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require('hardhat-abi-exporter');
const secrets = require("./secrets.json");
const config = require("./config.json");

/**
 * @dev Optimizer is on (200 Runs). Uses solidity 0.8.4
 */
module.exports = {
  solidity: {
    compilers: [
    {version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
    }
    ]
  },
  networks: {
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${secrets.infuraApiKey}`,
      chainId: 4,
      gasPrice: config.testnetGasPrice,
      accounts: [secrets.testnetPrivateKey]
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${secrets.infuraApiKey}`,
      chainId: 1,
      gasPrice: config.mainnetGasPrice,
      accounts: [secrets.mainnetPrivateKey]
    }
  }, etherscan:
  {
    apiKey: secrets.etherscanApiKey
  },
  abiExporter: {
    path: './artifacts/build-info/abi',
    flat: false,
    spacing: 2
  },  
  mocha: {
    "timeout": 250e3
  }
};


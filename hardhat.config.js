require('dotenv').config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');
require("hardhat-gas-reporter");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const ALCHEMY_API_KEY_GOERLI = process.env.ALCHEMY_API_KEY_GOERLI;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const REPORT_GAS = process.env.REPORT_GAS;
const COINMARKETCAP = process.env.COINMARKETCAP_API_KEY;

module.exports = {
    // defaultNetwork: "goerli",
    solidity: {
        version: "0.8.18",
        // solidity optimizer setting
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        goerli: {
            url: `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY_GOERLI}`,
            accounts: [`${PRIVATE_KEY}`]
        }
    },
    gasReporter: {
        currency: 'USD',
        // gasPrice: 21,
        // showTimeSpent: true,
        // onlyCalledMethods: false,
        enabled: (REPORT_GAS) ? true : false,
        coinmarketcap: COINMARKETCAP
    }
};

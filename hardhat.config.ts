import type { HardhatUserConfig, HttpNetworkUserConfig } from "hardhat/types";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "solidity-coverage";
import "hardhat-deploy";
import dotenv from "dotenv";
import yargs from "yargs";
import { getSingletonFactoryInfo } from "@gnosis.pm/safe-singleton-factory";

const argv = yargs
  .option("network", {
    type: "string",
    default: "hardhat",
  })
  .help(false)
  .version(false).argv;

// Load environment variables.
dotenv.config();
const { NODE_URL, INFURA_KEY, MNEMONIC, ETHERSCAN_API_KEY, PK, SOLIDITY_VERSION, SOLIDITY_SETTINGS, CUSTOM_DETERMINISTIC_DEPLOYMENT } = process.env;

const DEFAULT_MNEMONIC =
  "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

const sharedNetworkConfig: HttpNetworkUserConfig = {};
if (PK) {
  sharedNetworkConfig.accounts = [PK];
} else {
  sharedNetworkConfig.accounts = {
    mnemonic: MNEMONIC || DEFAULT_MNEMONIC,
  };
}

if (["mainnet", "rinkeby", "kovan", "goerli", "ropsten", "mumbai", "polygon"].includes(argv.network) && INFURA_KEY === undefined) {
  throw new Error(
    `Could not find Infura key in env, unable to connect to network ${argv.network}`,
  );
}

import "./src/tasks/local_verify"
import "./src/tasks/deploy_contracts"
import "./src/tasks/show_codesize"
import { BigNumber } from "@ethersproject/bignumber";

const primarySolidityVersion = SOLIDITY_VERSION || "0.7.6"
const soliditySettings = !!SOLIDITY_SETTINGS ? JSON.parse(SOLIDITY_SETTINGS) : undefined

const deterministicDeployment = CUSTOM_DETERMINISTIC_DEPLOYMENT == "true" ?
  (network: string) => {
    const info = (()=>{
      // DG Note: generated via https://github.com/safe-global/safe-singleton-factory
      // (see https://github.com/OffchainLabs/safe-contracts#replay-protection-eip-155)
      if (network === '1337'){
        return {
          "gasPrice": 100000000000,
          "gasLimit": 100000,
          "signerAddress": "0x3f1Eae7D46d88F08fc2F8ed27FCb2AB183EB2d0E",
          "transaction": "0xf8a78085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf3820a95a0aba1cce495eceace76f7eeb7fcaaa5cdeefe4536166cb7a45890e753db95f2f0a059e0498f3083a6d15a1de157fdbd301c826dba8d735382d1c83b44c683fb5738",
          "address": "0xda52b25ddB0e3B9CC393b0690Ac62245Ac772527"
        }
      }
      if (network === '412346'){
        return {
          "gasPrice": 100000000000,
          "gasLimit": 100000,
          "signerAddress": "0x3f1Eae7D46d88F08fc2F8ed27FCb2AB183EB2d0E",
          "transaction": "0xf8a88085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf3830c9598a054499f0beecc738ed04f6d0997f610986d4303aca01b9b6cd9cb549430f622d4a00ab4b93155c922fbd2c6e853b2083f21de13a07ec0f3c121b8b86848d5c5ceb4",
          "address": "0xda52b25ddB0e3B9CC393b0690Ac62245Ac772527"
        }
      }
      return getSingletonFactoryInfo(parseInt(network))
    })()
    
    if (!info) return undefined
    return {
      factory: info.address,
      deployer: info.signerAddress,
      funding: BigNumber.from(info.gasLimit).mul(BigNumber.from(info.gasPrice)).toString(),
      signedTx: info.transaction
    }
  } : undefined
console.warn('deterministicDeployment', deterministicDeployment);

const userConfig: HardhatUserConfig = {
  paths: {
    artifacts: "build/artifacts",
    cache: "build/cache",
    deploy: "src/deploy",
    sources: "contracts",
  },
  solidity: {
    compilers: [
      { version: primarySolidityVersion, settings: soliditySettings },
      { version: "0.6.12" },
      { version: "0.5.17" },
    ]
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      blockGasLimit: 100000000,
      gas: 100000000
    },
    mainnet: {
      ...sharedNetworkConfig,
      url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    },
    xdai: {
      ...sharedNetworkConfig,
      url: "https://xdai.poanetwork.dev",
    },
    ewc: {
      ...sharedNetworkConfig,
      url: `https://rpc.energyweb.org`,
    },
    rinkeby: {
      ...sharedNetworkConfig,
      url: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
    },
    goerli: {
      ...sharedNetworkConfig,
      url: `https://goerli.infura.io/v3/${INFURA_KEY}`,
    },
    ropsten: {
      ...sharedNetworkConfig,
      url: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
    },
    kovan: {
      ...sharedNetworkConfig,
      url: `https://kovan.infura.io/v3/${INFURA_KEY}`,
    },
    mumbai: {
      ...sharedNetworkConfig,
      url: `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`,
    },
    polygon: {
      ...sharedNetworkConfig,
      url: `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
    },
    volta: {
      ...sharedNetworkConfig,
      url: `https://volta-rpc.energyweb.org`,
    },
    bsc: {
      ...sharedNetworkConfig,
      url: `https://bsc-dataseed.binance.org/`,
    },
    arbitrum: {
      ...sharedNetworkConfig,
      url: `https://arb1.arbitrum.io/rpc`,
    },
    fantomTestnet: {
      ...sharedNetworkConfig,
      url: `https://rpc.testnet.fantom.network/`,
    },
    avalanche: {
      ...sharedNetworkConfig,
      url: `https://api.avax.network/ext/bc/C/rpc`,
    },
    localGeth: {
      ...sharedNetworkConfig,
      url: `http://localhost:8545`,
    },
    localArb: {
      ...sharedNetworkConfig,
      url: `http://localhost:8547`,
    },
  },
  deterministicDeployment,
  namedAccounts: {
    deployer: 0,
  },
  mocha: {
    timeout: 2000000,
  },
  // etherscan: {
  //   apiKey: ETHERSCAN_API_KEY,
  // },
};
if (NODE_URL) {
  userConfig.networks!!.custom = {
    ...sharedNetworkConfig,
    url: NODE_URL,
  }
}
export default userConfig

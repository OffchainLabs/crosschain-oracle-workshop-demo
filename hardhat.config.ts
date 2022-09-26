import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { task } from "hardhat/config";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { L1ToL2MessageGasEstimator, L1TransactionReceipt } from "@arbitrum/sdk";
import { addressAlias } from "./alias";

require("dotenv").config();

const config = {
  solidity: "0.7.0",
  networks: {
    goerli: {
      url: "https://goerli.infura.io/v3/" + String(process.env.INFURA_KEY),
      accounts: [String(process.env.TESTNET_PRIVKEY)]
    },
    arbgoerli: {
      url: "https://goerli-rollup.arbitrum.io/rpc",
      accounts: [String(process.env.TESTNET_PRIVKEY)]
    }
  }
};

task("deploy-oracles-arb-goerli", "deploys oracles", async (taskArgs, hre) => {
  const ARB_INBOX = "0x6BEbC4925716945D46F0Ec336D5C2564F419682C";
  const L1_CHAINLINK_ORACLE = "0xb4c4a493AB6356497713A78FFA6c60FB53517c63";
  const L1_UNI_ORACLE = "0x2402F26029a70ECd02d15FF2d7E0625c52A4b14F";

  const L2_CHAINLINK_ORACLE = "0x579434474bcF4A7CC3F6a1aB1C93e5F4867EE03a";
  const L2_UNI_ORACLE = "0xa716d0d29C7B67750f7333c6Df537F481C999b3d";
  const L2_SEQ_UPTIMEFEED = "0x4B36AB427827EfF0706B95a62FB08ba444b00a7F";

  const l1Provider = new JsonRpcProvider(config.networks.goerli.url);
  const l1Signer = new Wallet(config.networks.goerli.accounts[0]).connect(
    l1Provider
  );
  const l2Provider = new JsonRpcProvider(config.networks.arbgoerli.url);
  const l2Signer = new Wallet(config.networks.arbgoerli.accounts[0]).connect(
    l2Provider
  );

  // Deploy l1 getter lib
  const l1GetterLib__factory = (
    await hre.ethers.getContractFactory("PriceOracleGetter")
  ).connect(l1Signer);
  const l1Lib = await l1GetterLib__factory.deploy();
  await l1Lib.deployed();
  console.log(`l1Lib getter lib deployed to ${l1Lib.address}`);

  const L1Oracle__factory = (
    await hre.ethers.getContractFactory("L1OracleMessager", {
      libraries: {
        PriceOracleGetter: "0x887Cac086b618907361612f2d1197960e8b87835"
      }
    })
  ).connect(l1Signer);
  const l1Oracle = await L1Oracle__factory.deploy();
  await l1Oracle.deployed();
  console.log(`l1Oracle deployed to ${l1Oracle.address}`);

  const l2GetterLib__factory = (
    await hre.ethers.getContractFactory("PriceOracleGetter")
  ).connect(l2Signer);
  const l2Lib = await l2GetterLib__factory.deploy();
  await l2Lib.deployed();
  console.log(`l2Lib getter lib deployed to ${l2Lib.address}`);

  const L2Oracle__factory = (
    await hre.ethers.getContractFactory("L2Oracle", {
      libraries: {
        PriceOracleGetter: "0x69269c5630D4331d62C956BA4A4D3F3189847bBd"
      }
    })
  ).connect(l2Signer);
  let L2Oracle = await L2Oracle__factory.deploy();
  await L2Oracle.deployed();
  console.log(`L2Oracle deployed to ${L2Oracle.address}`);

  let res = await l1Oracle.initialize(
    L2Oracle.address,
    ARB_INBOX,
    L1_CHAINLINK_ORACLE,
    L1_UNI_ORACLE
  );
  let rec = await res.wait();
  console.log(`L1 oracle initialized ${rec.transactionHash}`);

  res = await L2Oracle.initialize(
    addressAlias(l1Oracle.address),
    L2_UNI_ORACLE,
    L2_CHAINLINK_ORACLE,
    L2_SEQ_UPTIMEFEED
  );
  rec = await res.wait();
  console.log(`L2 oracle initialized ${rec.transactionHash}`);
});

task("update-oracle", "Prints the list of accounts")
  .addParam("oracleaddress", "l1 address")
  .setAction(async (taskArgs, hre) => {
    const l1Provider = new JsonRpcProvider(config.networks.goerli.url);
    const l1Signer = new Wallet(config.networks.goerli.accounts[0]).connect(
      l1Provider
    );
    const l2Provider = new JsonRpcProvider(config.networks.arbgoerli.url);

    const l1OracleMessager = (
      await hre.ethers.getContractFactory("L1OracleMessager", {
        libraries: {
          PriceOracleGetter: "0x887Cac086b618907361612f2d1197960e8b87835"
        }
      })
    )
      .attach(taskArgs.oracleaddress)
      .connect(l1Signer);

    const l2OracleAddress = await l1OracleMessager.l2Oracle();

    const l1BaseFee = await l1Provider.getGasPrice();

    const gasEstimator = new L1ToL2MessageGasEstimator(l2Provider);

    const l2CallData = hre.ethers.utils.hexlify(
      await l1OracleMessager.getL2RetryableCalldata()
    );

    console.log('Getting retryable gas estimate data:');
    
    const gasEstimateResults = await gasEstimator.estimateAll(
      taskArgs.oracleaddress,
      l2OracleAddress,
      l2CallData,
      hre.ethers.constants.Zero,
      l1BaseFee,
      l1Signer.address,
      l1Signer.address,
      l1Provider
    );
    console.info("gasEstimateResults", gasEstimateResults);
    console.info("Initiating x chain message:");
    const res = await l1OracleMessager.sendOracleDataToL2(
      gasEstimateResults.maxSubmissionFee,
      gasEstimateResults.maxFeePerGas,
      gasEstimateResults.gasLimit,
      l1Signer.address,
      {
        value: gasEstimateResults.totalL2GasCosts
      }
    );
    const receipt = new L1TransactionReceipt(await res.wait());

    const retryableTicket = await receipt.getL1ToL2Message(l2Provider);
    console.log(
      "L1 message published",
      receipt.transactionHash,
      "waiting for retryable ticket creation:"
    );

    const status = await retryableTicket.waitForStatus();
    console.log("done!", status);
  });

export default config;

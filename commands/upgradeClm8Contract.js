const yargs = require("yargs/yargs")(process.argv.slice(3));
const argv = yargs.usage("Upgrade a specified CLM8 contract to a newly deployed contract\n\nUsage: truffle exec $0 [options]")
  .option("network", {
    alias: "n",
    describe: "Specify the network to use, saving artifacts specific to that network. Network name must exist in the configuration.",
    type: "string",
    choices: ["development", "ropsten", "kovan", "rinkeby", "goerli", "mainnet"],
    default: "development"
  })
  .fail((msg, err, yargs) => {
    console.log(msg);
    process.exit(1);
  })
  .argv;

const { deployProxy, upgradeProxy } = require("@openzeppelin/truffle-upgrades");
const { getWeb3, getNamedAccounts } = require("../src/utils");

// const CarbonEmissionsTokenNetwork = require("../src/abis/CarbonEmissionsTokenNetwork.json");
// const CarbonEmissionsTokenNetworkV2 = require("../src/abis/CarbonEmissionsTokenNetworkV2.json");

const CarbonEmissionsTokenNetwork = artifacts.require("CarbonEmissionsTokenNetwork");
const CarbonEmissionsTokenNetworkV2 = artifacts.require("CarbonEmissionsTokenNetworkV2");

module.exports = async function(callback) {
  const web3 = getWeb3(argv.network);
  try {
    const accounts = await web3.eth.getAccounts();
    const { owner } = getNamedAccounts(accounts);
    const networkId = await web3.eth.net.getId();
    // const current = new web3.eth.Contract(CarbonEmissionsTokenNetwork.abi, CarbonEmissionsTokenNetwork.networks[networkId].address, {
    //   from: owner
    // });
    console.log(123);
    const carbonEmissionsTokenNetwork = await deployProxy(
      CarbonEmissionsTokenNetwork,
      [owner],
      {
        initialize: "store"
      }
    );
    console.log(456);
    const carbonEmissionsTokenNetworkV2 = await upgradeProxy(
      carbonEmissionsTokenNetwork.address,
      CarbonEmissionsTokenNetworkV2
    );

    // output new implementation address
    console.log("New CarbonEmissionsTokenNetwork implementation deployed to:", carbonEmissionsTokenNetworkV2.implementation);
    console.log(`The same address ${carbonEmissionsTokenNetworkV2.address} can be used to interact with the contract.`);
  } catch (err) {
    console.log(err);
  }
  callback(0);
}
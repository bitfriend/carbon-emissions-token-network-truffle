const yargs = require("yargs/yargs")(process.argv.slice(3));
const argv = yargs.usage("Set limited mode on a CarbonEmissionsTokenNetwork contract\n\nUsage: truffle exec $0 [options]")
  .option("network", {
    alias: "n",
    describe: "Specify the network to use, saving artifacts specific to that network. Network name must exist in the configuration.",
    type: "string",
    choices: ["development", "ropsten", "kovan", "rinkeby", "goerli", "mainnet"],
    default: "development"
  })
  .option("contract", {
    alias: "c",
    // demandOption: true,
    describe: "The CLM8 contract",
    type: "string"
  })
  .option("value", {
    alias: "v",
    demandOption: true,
    describe: "True or false to set limited mode",
    type: "boolean"
  })
  .fail((msg, err, yargs) => {
    console.log(msg);
    process.exit(1);
  })
  .argv;

const { getWeb3, getNamedAccounts } = require("../src/utils");

const CarbonEmissionsTokenNetwork = require("../src/abis/CarbonEmissionsTokenNetwork.json");

module.exports = async function(callback) {
  const web3 = getWeb3(argv.network);
  try {
    const accounts = await web3.eth.getAccounts();
    const { owner } = getNamedAccounts(accounts);
    const networkId = await web3.eth.net.getId();
    const contract = new web3.eth.Contract(CarbonEmissionsTokenNetwork.abi, CarbonEmissionsTokenNetwork.networks[networkId].address, {
      from: owner
    });
    const tx = contract.methods.setLimitedMode(argv.value);
    const gas = await tx.estimateGas({
      from: owner
    });
    const gasPrice = await web3.eth.getGasPrice();
    await tx.send({
      gas,
      gasPrice,
      from: owner
    });
  } catch (err) {
    console.log(err);
  }
  callback(0);
}
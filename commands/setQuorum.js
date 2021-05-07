const yargs = require("yargs/yargs")(process.argv.slice(3));
const argv = yargs.usage("Set the quorum value on a Governor contract\n\nUsage: truffle exec $0 [options]")
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
    describe: "The Governor contract",
    type: "string"
  })
  .option("value", {
    alias: "v",
    demandOption: true,
    describe: "The new quorum value in votes",
    type: "number"
  })
  .fail((msg, err, yargs) => {
    console.log(msg);
    process.exit(1);
  })
  .argv;

const { getWeb3, getNamedAccounts } = require("../src/utils");

const Governor = require("../src/abis/Governor.json");

module.exports = async function(callback) {
  const web3 = getWeb3(argv.network);
  try {
    const accounts = await web3.eth.getAccounts();
    const { owner } = getNamedAccounts(accounts);
    const networkId = await web3.eth.net.getId();
    const contract = new web3.eth.Contract(Governor.abi, Governor.networks[networkId].address, {
      from: owner
    });
    const value = web3.utils.toWei(argv.value.toString(), "gwei"); // times by 10**9
    const tx = contract.methods.setQuorum(value);
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
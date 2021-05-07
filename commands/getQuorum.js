const yargs = require("yargs/yargs")(process.argv.slice(3));
const argv = yargs.usage("Return the quorum value (minimum number of votes for a proposal to pass)\n\nUsage: truffle exec $0 [options]")
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
    const value = await contract.methods.quorumVotes().call();
    console.log(web3.utils.fromWei(value, "gwei"));
  } catch (err) {
    console.log(err);
  }
  callback(0);
}
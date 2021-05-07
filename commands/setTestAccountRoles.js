const yargs = require("yargs/yargs")(process.argv.slice(3));
const argv = yargs.usage("Set default account roles for testing\n\nUsage: truffle exec $0 [options]")
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
    const { owner, dealer1, dealer2, dealer3, consumer1, consumer2 } = getNamedAccounts(accounts);
    const networkId = await web3.eth.net.getId();
    const contract = new web3.eth.Contract(CarbonEmissionsTokenNetwork.abi, CarbonEmissionsTokenNetwork.networks[networkId].address, {
      from: owner
    });
    let tx, gas, gasPrice;

    tx = contract.methods.registerDealer(dealer1, 1); // REC dealer
    gas = await tx.estimateGas({
      from: owner
    });
    gasPrice = await web3.eth.getGasPrice();
    await tx.send({
      gas,
      gasPrice,
      from: owner
    });
    console.log(`Account ${dealer1} is now a REC dealer`);

    tx = contract.methods.registerDealer(dealer2, 3); // emissions auditor
    gas = await tx.estimateGas({
      from: owner
    });
    gasPrice = await web3.eth.getGasPrice();
    await tx.send({
      gas,
      gasPrice,
      from: owner
    });
    console.log(`Account ${dealer2} is now an emissions auditor`);

    tx = contract.methods.registerDealer(dealer3, 2); // offsets dealer
    gas = await tx.estimateGas({
      from: owner
    });
    gasPrice = await web3.eth.getGasPrice();
    await tx.send({
      gas,
      gasPrice,
      from: owner
    });
    console.log(`Account ${dealer3} is now an offsets dealer`);

    tx = contract.methods.registerConsumer(consumer1);
    gas = await tx.estimateGas({
      from: owner
    });
    gasPrice = await web3.eth.getGasPrice();
    await tx.send({
      gas,
      gasPrice,
      from: owner
    });
    console.log(`Account ${consumer1} is now a consumer`);

    tx = contract.methods.registerConsumer(consumer2);
    gas = await tx.estimateGas({
      from: owner
    });
    gasPrice = await web3.eth.getGasPrice();
    await tx.send({
      gas,
      gasPrice,
      from: owner
    });
    console.log(`Account ${consumer2} is now a consumer`);
  } catch (err) {
    console.log(err);
  }
  callback(0);
}
const yargs = require("yargs/yargs")(process.argv.slice(3));
const argv = yargs.usage("Give DAO tokens to default account roles for testing\n\nUsage: truffle exec $0 [options]")
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
    describe: "The dCLM8 token",
    type: "string"
  })
  .fail((msg, err, yargs) => {
    console.log(msg);
    process.exit(1);
  })
  .argv;

const { getWeb3, getNamedAccounts } = require("../src/utils");

const DAOToken = require("../src/abis/DAOToken.json");

module.exports = async function(callback) {
  const web3 = getWeb3(argv.network);
  try {
    const accounts = await web3.eth.getAccounts();
    const { owner, dealer1, dealer2, dealer3, consumer1, consumer2 } = getNamedAccounts(accounts);
    const networkId = await web3.eth.net.getId();
    const contract = new web3.eth.Contract(DAOToken.abi, DAOToken.networks[networkId].address, {
      from: owner
    });

    const decimals = new web3.utils.BN("1000000000000000000");
    const tokens = new web3.utils.BN("500000");
    const i = tokens.mul(decimals);

    let tx, gas, gasPrice;

    tx = contract.methods.transfer(dealer1, i);
    gas = await tx.estimateGas({
      from: owner
    });
    gasPrice = await web3.eth.getGasPrice();
    await tx.send({
      gas,
      gasPrice,
      from: owner
    });
    console.log(`Gave ${tokens} DAO Tokens to ${dealer1}`);

    tx = contract.methods.transfer(dealer2, i);
    gas = await tx.estimateGas({
      from: owner
    });
    gasPrice = await web3.eth.getGasPrice();
    await tx.send({
      gas,
      gasPrice,
      from: owner
    });
    console.log(`Gave ${tokens} DAO Tokens to ${dealer2}`);

    tx = contract.methods.transfer(dealer3, i);
    gas = await tx.estimateGas({
      from: owner
    });
    gasPrice = await web3.eth.getGasPrice();
    await tx.send({
      gas,
      gasPrice,
      from: owner
    });
    console.log(`Gave ${tokens} DAO Tokens to ${dealer3}`);

    tx = contract.methods.transfer(consumer1, i);
    gas = await tx.estimateGas({
      from: owner
    });
    gasPrice = await web3.eth.getGasPrice();
    await tx.send({
      gas,
      gasPrice,
      from: owner
    });
    console.log(`Gave ${tokens} DAO Tokens to ${consumer1}`);

    tx = contract.methods.transfer(consumer2, i);
    gas = await tx.estimateGas({
      from: owner
    });
    gasPrice = await web3.eth.getGasPrice();
    await tx.send({
      gas,
      gasPrice,
      from: owner
    });
    console.log(`Gave ${tokens} DAO Tokens to ${consumer2}`);
  } catch (err) {
    console.log(err);
  }
  callback(0);
}
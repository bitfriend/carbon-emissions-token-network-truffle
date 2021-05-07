const DAOToken = artifacts.require("Governance/DAOToken");
const Governor = artifacts.require("Governance/Governor");
const Timelock = artifacts.require("Governance/Timelock");

const { getWeb3, getNamedAccounts, hoursToSeconds, advanceHours, advanceBlocks } = require("../src/utils");

module.exports = async function(deployer, network, accounts) {
  const { owner } = getNamedAccounts(accounts);

  const daoToken = await DAOToken.deployed();

  console.log(`Deploying DAO with account: ${owner}`);

  await deployer.deploy(
    Timelock,
    owner, // inital admin
    172800, // default time delay (2 days)
    { from: owner }
  );
  const timelock = await Timelock.deployed();

  await deployer.deploy(
    Governor,
    timelock.address, // address of timelock
    daoToken.address, // address of DAO token
    owner, // guardian of governor
    { from: owner }
  );
  const governor = await Governor.deployed();

  console.log("Governor deployed to:", governor.address);

  let skippedActions = 0;
  let tx, gas, gasPrice;
  const web3 = getWeb3(network);

  // set governor on DAOToken contract (for permission to burn tokens)
  try {
    tx = daoToken.methods.setGovernor(governor.address);
    gas = await tx.estimateGas({
      from: owner
    });
    gasPrice = await web3.eth.getGasPrice();
    await tx.send({
      gas,
      gasPrice,
      from: owner
    });
    // daoToken.methods["setGovernor(address)"](governor.address);
    console.log("Initialized Governor address on DAOToken.");
  } catch (e) {
    console.log("Skipped setGovernor() on DAOToken.");
    skippedActions++;
  }

  // format transactions for Timelock to change admin to Governor
  let timelockNewAdmin;
  try {
    const blockNumber = await web3.eth.getBlockNumber();
    const block = await web3.eth.getBlock(blockNumber);
    const currentTime = block.timestamp;
    console.log("currentTime", currentTime);
    console.log("eta", currentTime + hoursToSeconds(50));
    timelockNewAdmin = {
      target: timelock.address,
      value: 0,
      signature: "setPendingAdmin(address)",
      data: web3.eth.abi.encodeParameters(["address"], [governor.address]),
      eta: currentTime + hoursToSeconds(50)
    };
    tx = timelock.methods.queueTransaction(
      timelockNewAdmin.target,
      timelockNewAdmin.value,
      timelockNewAdmin.signature,
      timelockNewAdmin.data,
      timelockNewAdmin.eta
    );
    gas = await tx.estimateGas({
      from: owner
    });
    gasPrice = await web3.eth.getGasPrice();
    await tx.send({
      gas,
      gasPrice,
      from: owner
    });
    console.log("Queued setPendingAdmin() on Timelock.");
  } catch (e) {
    console.log("Skipped changing admin on Governor to Timelock.");
    skippedActions++;
  }

  // perform time/block skip if local network to switch timelock admin automatically
  if (network !== "mainnet" && skippedActions < 2) {
    await advanceHours(web3, 51);
    console.log("Advanced 51 hours.");

    // execute setPendingAdmin on Timelock
    tx = timelock.methods.executeTransaction(
      timelockNewAdmin.target,
      timelockNewAdmin.value,
      timelockNewAdmin.signature,
      timelockNewAdmin.data,
      timelockNewAdmin.eta
    );
    gas = await tx.estimateGas({
      from: owner
    });
    gasPrice = await web3.eth.getGasPrice();
    await tx.send({
      gas,
      gasPrice,
      from: owner
    });
    console.log("Executed setPendingAdmin() on Timelock.");
    await advanceBlocks(web3, 1);

    // accept admin role from Governor contract
    governor.methods["__acceptAdmin()"]();
    await advanceBlocks(web3, 1);

    console.log("Called __acceptAdmin() on Governor.");

    console.log("Done performing Timelock admin switch.");
  } else { // otherwise, output args to complete the timelock admin switch
    if (timelockNewAdmin && skippedActions < 2) {
      const date = new Date(timelockNewAdmin.eta * 1000);
      console.log("---");
      console.log(`Please copy and paste this command after ${date.toString()}`);
      console.log("to complete the Timelock admin switch:");
      console.log("");
      console.log(`npx hardhat completeTimelockAdminSwitch --network ${hre.network.name} --timelock ${timelock.address} --governor ${governor.address} --target ${timelockNewAdmin.target} --value ${timelockNewAdmin.value} --signature "${timelockNewAdmin.signature}" --data ${timelockNewAdmin.data} --eta ${timelockNewAdmin.eta}`);
      console.log("");
      console.log("---");
    }
  }
};

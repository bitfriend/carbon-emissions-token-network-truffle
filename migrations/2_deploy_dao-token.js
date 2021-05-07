const DAOToken = artifacts.require("Governance/DAOToken");
const { getNamedAccounts } = require("../src/utils");

module.exports = async function(deployer, network, accounts) {
  const { owner } = getNamedAccounts(accounts);

  console.log(`Deploying DAOToken with account: ${owner}`);

  await deployer.deploy(
    DAOToken,
    owner, // inital token holder
    { from: owner }
  );

  const daoToken = await DAOToken.deployed();

  console.log("DAO Token deployed to:", daoToken.address);
  if (network !== "mainnet") {
    // delegate owner voting power to self
    await daoToken.methods["delegate(address)"](owner);
    console.log("Delegated voting power of deployer to self.");
  }
};

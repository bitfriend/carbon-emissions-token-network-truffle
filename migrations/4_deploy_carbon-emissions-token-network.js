const CarbonEmissionsTokenNetwork = artifacts.require("CarbonEmissionsTokenNetwork");
const Timelock = artifacts.require("Governance/Timelock");

const { deployProxy } = require("@openzeppelin/truffle-upgrades");
const { getNamedAccounts } = require("../src/utils");

module.exports = async function(deployer, network, accounts) {
  const { owner } = getNamedAccounts(accounts);

  console.log(`Deploying CarbonEmissionsTokenNetwork with account: ${owner}`);

  const carbonEmissionsTokenNetwork = await deployProxy(
    CarbonEmissionsTokenNetwork,
    [owner],
    {
      deployer,
      initialize: "store"
    }
  );

  console.log("CarbonEmissionsTokenNetwork deployed to:", carbonEmissionsTokenNetwork.address);

  const timelock = await Timelock.deployed();
  carbonEmissionsTokenNetwork.methods["setTimelock(address)"](timelock.address);
  console.log("Timelock address set so that the DAO has permission to issue tokens with issueOnBehalf().");
};

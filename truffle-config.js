const path = require("path");
const networks = require("./src/truffle-networks");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "src/abis"),
  networks,
  // mocha: {
  //   reporter: "eth-gas-reporter",
  //   reporterOptions: {
  //     currency: "USD"
  //   }
  // },
  compilers: {
    solc: {
      version: "^0.7.0",
      // Avoid "CompilerError: Stack too deep"
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};

const networks = require('./truffle-networks');
const Web3 = require('web3');

function getProvider(networkType) {
  if (networkType === 'development') {
    return new Web3.providers.HttpProvider(`http://${networks.development.host}:${networks.development.port}`);
  }
  return networks[networkType].provider();
}

function getWeb3(networkType) {
  const provider = getProvider(networkType);
  return new Web3(provider);
}

const getNamedAccounts = (accounts) => ({
  owner: accounts[0],
  dealer1: accounts[1],
  dealer2: accounts[2],
  dealer3: accounts[3],
  dealer4: accounts[4],
  consumer1: accounts[5],
  consumer2: accounts[6],
  unregistered: accounts[7],
})

function hoursToSeconds(hours) {
  return hours * 60 * 60;
}

const advanceHours = (web3, hours) => new Promise((resolve, reject) => {
  // This function may be called multiple times
  // To make those adjustments effective, you need to force a block
  // to be mined after you've ran evm_increaseTime
  const seconds = hoursToSeconds(hours);
  web3.currentProvider.send({
    jsonrpc: "2.0",
    method: "evm_increaseTime",
    params: [seconds],
    id: new Date().getTime()
  }, (error0, result0) => {
    if (error0) {
      return reject(error0);
    }
    web3.currentProvider.send({
      jsonrpc: "2.0",
      method: "evm_mine",
      // params: [],
      id: new Date().getTime()
    }, (error1, result1) => {
      if (error1) {
        return reject(error1);
      }
      return resolve([result0, result1]);
    });
  });
})

const advanceBlocks = (web3, blocks) => new Promise((resolve0, reject0) => {
  const promises = [];
  for (let i = 0; i < blocks; i++) {
    promises.push(new Promise((resolve, reject) => {
      web3.currentProvider.send({
        jsonrpc: "2.0",
        method: "evm_mine",
        // params: [],
        id: new Date().getTime()
      }, (error, result) => {
        if (error) {
          return reject(error);
        }
        return resolve(result);
      });
    }));
  }
  Promise.all(promises).then(values => {
    resolve0(values);
  }).catch(err => {
    reject0(err);
  });
})

module.exports = {
  getWeb3,
  getNamedAccounts,
  hoursToSeconds,
  advanceHours,
  advanceBlocks
}

// myweb3.js

const Web3 = require('web3');
const config = require('./config');

// Set up Web3.js
const web3 = new Web3(config.infuraURL);
const contractAddress = config.contractAddress;
const abi = config.contractABI;
const contract = new web3.eth.Contract(abi, contractAddress);
const privateKey = config.privateKey;
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
const gasPrice = '20000000000';

module.exports = {
  web3, // Export the Web3 instance
  contractAddress,
  abi,
  contract, // Export the contract instance
  privateKey,
  account,
  gasPrice,
};

const WalletFactory = artifacts.require("WalletFactory");
const ERC20Mock = artifacts.require("ERC20Mock");
const AnotherToken = artifacts.require("AnotherToken");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(WalletFactory);
  deployer.deploy(ERC20Mock, accounts[0], 10000);
  deployer.deploy(AnotherToken, accounts[0], 10);
};

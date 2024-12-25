// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Wallet.sol";

contract WalletFactory {
  mapping(address => Wallet) public wallets;

  function createWallet() public {
    require(address(wallets[msg.sender]) == address(0), "One wallet per address is allowed");

    Wallet wallet = new Wallet();
    wallet.transferOwnership(msg.sender);
    
    wallets[msg.sender] = wallet;
  }
}

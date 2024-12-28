// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Wallet.sol";

contract WalletFactory {
  mapping(address => Wallet) public wallets;

  function createWallet(
    address _owner,
    address[] memory _guardianAddress,
    uint256 _guardiansRequired
  ) public {
    require(address(wallets[msg.sender]) == address(0), "One wallet per address is allowed");

    Wallet wallet = new Wallet(
      _owner,
      _guardianAddress,
      _guardiansRequired
    );
    
    wallets[msg.sender] = wallet;
  }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    constructor(address to, uint256 initialSupply) ERC20("MockToken", "MTK") {
        _mint(to, initialSupply);
    }
}

contract AnotherToken is ERC20 {
    constructor(address to, uint256 initialSupply) ERC20("AnotherToken", "ATK") {
        _mint(to, initialSupply);
    }
}

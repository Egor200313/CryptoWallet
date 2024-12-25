// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Wallet is Ownable {
    constructor () Ownable(msg.sender) {}
    
    function depositToken(IERC20 token, uint amount) public {
        token.transferFrom(msg.sender, address(this), amount);
    }

    function sendToken(IERC20 token, address to, uint amount) public onlyOwner {
        token.transfer(to, amount);
    }

    function balanceOfToken(IERC20 token) public onlyOwner view returns (uint) {
        return token.balanceOf(address(this));
    }
    
    function withdrawToken(IERC20 token, uint amount) public onlyOwner {
        token.transfer(msg.sender, amount);
    }

}

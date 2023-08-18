// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EscrowERC20 is Ownable {
    
    event DepositedERC20(address indexed depositor, address indexed tokenAddress, uint256 amount);
    event WithdrawnERC20(address indexed recipient, address indexed tokenAddress, uint256 amount);

    function deposit(address tokenAddress, uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
        emit DepositedERC20(msg.sender, tokenAddress, amount);
    }

    function withdraw(address[] memory tokenAddresses, uint256[] memory amounts, address[] memory recipients) external onlyOwner {
        require(tokenAddresses.length == amounts.length && amounts.length == recipients.length, "Input lengths do not match");
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            IERC20(tokenAddresses[i]).transfer(recipients[i], amounts[i]);
            emit WithdrawnERC20(recipients[i], tokenAddresses[i], amounts[i]);
        }
    }
}

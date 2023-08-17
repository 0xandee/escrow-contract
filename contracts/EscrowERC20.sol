// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EscrowERC20 is Ownable {
    IERC20 public token;
    
    // address tokenOwner => uint256 balance
    mapping(address => uint256) public balanceOf;

    event Deposited(address indexed tokenOwner, uint256 amount);
    event Withdrawn(address indexed tokenOwner, uint256 amount);

    constructor(address tokenAddress) {
        token = IERC20(tokenAddress);
    }
    
    function deposit(uint256 amount) external {
        require(amount > 0, "Amount should be greater than 0");
        token.transferFrom(msg.sender, address(this), amount);

        // Update the balance of the depositor
        balanceOf[msg.sender] += amount;

        emit Deposited(msg.sender, amount);
    }

    function withdraw(address[] calldata beneficiaries, uint256[] calldata amounts) external onlyOwner {
        require(beneficiaries.length == amounts.length, "Input array lengths must match");
        for (uint i = 0; i < beneficiaries.length; i++) {
            address beneficiary = beneficiaries[i];
            uint256 amount = amounts[i];

            require(balanceOf[beneficiary] >= amount, "Not enough balance for the beneficiary");

            // Update the balance of the beneficiary
            balanceOf[beneficiary] -= amount;
            
            token.transfer(beneficiary, amount);
            emit Withdrawn(beneficiary, amount);
        }
    }
}

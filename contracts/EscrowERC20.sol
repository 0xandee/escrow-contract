// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract EscrowERC20 is OwnableUpgradeable {
    
    event DepositedERC20(address indexed depositor, address indexed tokenAddress, uint256 amount);
    event WithdrawnERC20(address indexed recipient, address indexed tokenAddress, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() initializer public {
        __Ownable_init();
    }

    function deposit(address tokenAddress, uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        IERC20Upgradeable(tokenAddress).transferFrom(msg.sender, address(this), amount);
        emit DepositedERC20(msg.sender, tokenAddress, amount);
    }

    function withdraw(address[] memory tokenAddresses, uint256[] memory amounts, address[] memory recipients) external onlyOwner {
        require(tokenAddresses.length == amounts.length && amounts.length == recipients.length, "Input lengths do not match");
        for (uint256 i = 0; i < tokenAddresses.length; i++) {
            IERC20Upgradeable(tokenAddresses[i]).transfer(recipients[i], amounts[i]);
            emit WithdrawnERC20(recipients[i], tokenAddresses[i], amounts[i]);
        }
    }
}

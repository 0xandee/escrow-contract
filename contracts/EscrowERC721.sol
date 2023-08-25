// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract EscrowERC721 is OwnableUpgradeable {
    
    event DepositedERC721(address indexed depositor, address indexed nftAddress, uint256 tokenId);
    event WithdrawnERC721(address indexed recipient, address indexed nftAddress, uint256 tokenId);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() initializer public {
        __Ownable_init();
    }

    function deposit(address contractAddress, uint256 tokenId) external {
        IERC721Upgradeable(contractAddress).transferFrom(msg.sender, address(this), tokenId);
        emit DepositedERC721(msg.sender, contractAddress, tokenId);
    }

    function withdraw(address[] memory contractAddresses, uint256[] memory tokenIds, address[] memory recipients) external onlyOwner {
        require(contractAddresses.length == tokenIds.length && tokenIds.length == recipients.length, "Input lengths do not match");
        for (uint256 i = 0; i < contractAddresses.length; i++) {
            IERC721Upgradeable(contractAddresses[i]).transferFrom(address(this), recipients[i], tokenIds[i]);
            emit WithdrawnERC721(recipients[i], contractAddresses[i], tokenIds[i]);
        }
    }
}

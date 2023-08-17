// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EscrowERC721 is Context, Ownable {
    IERC721 public nft;
    
    // address tokenOwner => uint256 balance
    mapping(address => uint256) public balanceOf;

    // uint256 tokenId => address tokenOwner
    mapping(uint256 => address) public stakedTokens;

    event Deposited(address indexed tokenOwner, uint256 indexed tokenId);
    event Withdrawn(address indexed tokenOwner, uint256 indexed tokenId);

    constructor(address nftAddress) {
        nft = IERC721(nftAddress);
    }
    
    function deposit(uint256 tokenId) external {
        nft.transferFrom(msg.sender, address(this), tokenId);

        // Tracking the owner of the deposited token
        stakedTokens[tokenId] = msg.sender;
        balanceOf[msg.sender]++;

        emit Deposited(msg.sender, tokenId);
    }

    function withdraw(uint256[] calldata tokenIds) external onlyOwner {
        for (uint i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            address tokenOwner = stakedTokens[tokenId];
            require(tokenOwner != address(0), "Token is not staked.");

            delete stakedTokens[tokenId];
            balanceOf[tokenOwner]--;
            nft.transferFrom(address(this), tokenOwner, tokenId);
            emit Withdrawn(tokenOwner, tokenId);
        }
    }
}

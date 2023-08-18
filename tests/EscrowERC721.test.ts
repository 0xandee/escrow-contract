import { ethers } from "hardhat";
import { expect } from "chai";
import { EscrowERC721, ERC721Mock } from "../types";
import { Signer } from "ethers";

describe("EscrowERC721", function () {
    let escrowERC721: EscrowERC721;
    let erc721Mock: ERC721Mock;
    let owner: Signer;
    let addr1: Signer;
    let addr2: Signer;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const ERC721MockFactory = await ethers.getContractFactory("ERC721Mock");
        erc721Mock = await ERC721MockFactory.connect(owner).deploy("TestToken", "TT");

        const EscrowERC721Factory = await ethers.getContractFactory("EscrowERC721");
        escrowERC721 = await EscrowERC721Factory.connect(owner).deploy();
    });

    describe("Deposit", function () {
        it("Should deposit an NFT to the escrow", async function () {
            await erc721Mock.connect(addr1).mint(addr1.getAddress(), 1);
            await erc721Mock.connect(addr1).approve(escrowERC721.getAddress(), 1);
            await escrowERC721.connect(addr1).deposit(erc721Mock.getAddress(), 1);

            expect(await erc721Mock.ownerOf(1)).to.equal(await escrowERC721.getAddress());
        });
    });

    describe("Withdraw", function () {
        it("Only owner can withdraw NFTs from the escrow", async function () {
            await erc721Mock.connect(addr1).mint(addr1.getAddress(), 1);
            await erc721Mock.connect(addr1).approve(escrowERC721.getAddress(), 1);
            await escrowERC721.connect(addr1).deposit(erc721Mock.getAddress(), 1);

            await expect(escrowERC721.connect(addr1).withdraw([erc721Mock.getAddress()], [1], [addr1.getAddress()])).to.be.revertedWith("Ownable: caller is not the owner");

            await escrowERC721.connect(owner).withdraw([erc721Mock.getAddress()], [1], [addr1.getAddress()]);

            expect(await erc721Mock.ownerOf(1)).to.equal(await addr1.getAddress());
        });
    });

    describe("Events", function () {
        it("Should emit DepositedERC721 event when an NFT is deposited", async function () {
            await erc721Mock.connect(addr1).mint(addr1.getAddress(), 1);
            await erc721Mock.connect(addr1).approve(escrowERC721.getAddress(), 1);

            await expect(escrowERC721.connect(addr1).deposit(erc721Mock.getAddress(), 1))
                .to.emit(escrowERC721, "DepositedERC721")
                .withArgs(await addr1.getAddress(), await erc721Mock.getAddress(), 1);
        });

        it("Should emit WithdrawnERC721 event when an NFT is withdrawn", async function () {
            await erc721Mock.connect(addr1).mint(addr1.getAddress(), 1);
            await erc721Mock.connect(addr1).approve(escrowERC721.getAddress(), 1);
            await escrowERC721.connect(addr1).deposit(erc721Mock.getAddress(), 1);

            await expect(escrowERC721.connect(owner).withdraw([erc721Mock.getAddress()], [1], [addr1.getAddress()]))
                .to.emit(escrowERC721, "WithdrawnERC721")
                .withArgs(await addr1.getAddress(), await erc721Mock.getAddress(), 1);
        });
    });
});

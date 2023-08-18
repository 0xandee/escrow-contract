// import { expect } from "chai";
// import { ethers } from "hardhat";
// import { EscrowERC721, ERC721Mock } from "../types";
// import { Signer } from "ethers";

// describe("EscrowERC721", function () {
//     let erc721: ERC721Mock;
//     let escrowERC721: EscrowERC721;
//     let owner: Signer;
//     let addr1: Signer;
//     let addr2: Signer;

//     beforeEach(async function () {
//         const ERC721MockFactory = await ethers.getContractFactory("ERC721Mock");
//         erc721 = (await ERC721MockFactory.deploy("TestToken", "TT")) as ERC721Mock;

//         const EscrowERC721Factory = await ethers.getContractFactory("EscrowERC721");
//         escrowERC721 = (await EscrowERC721Factory.deploy(erc721.getAddress())) as EscrowERC721;

//         [owner, addr1, addr2] = await ethers.getSigners();
//     });

//     describe("Deposit", function () {
//         it("Should deposit the token into the escrow", async function () {
//             await erc721.mint(addr1.getAddress(), 1);
//             await erc721.connect(addr1).approve(escrowERC721.getAddress(), 1);
//             await escrowERC721.connect(addr1).deposit(1);

//             expect(await escrowERC721.stakedTokens(1)).to.equal(await addr1.getAddress());
//             expect(await escrowERC721.balanceOf(addr1.getAddress())).to.equal(1);
//             expect(await erc721.ownerOf(1)).to.equal(await escrowERC721.getAddress());
//         });

//         it("Should handle multiple deposits from different addresses", async function () {
//             await erc721.mint(addr1.getAddress(), 1);
//             await erc721.mint(addr2.getAddress(), 2);

//             await erc721.connect(addr1).approve(escrowERC721.getAddress(), 1);
//             await erc721.connect(addr2).approve(escrowERC721.getAddress(), 2);

//             await escrowERC721.connect(addr1).deposit(1);
//             await escrowERC721.connect(addr2).deposit(2);

//             expect(await escrowERC721.stakedTokens(1)).to.equal(await addr1.getAddress());
//             expect(await escrowERC721.stakedTokens(2)).to.equal(await addr2.getAddress());

//             expect(await escrowERC721.balanceOf(addr1.getAddress())).to.equal(1);
//             expect(await escrowERC721.balanceOf(addr2.getAddress())).to.equal(1);
//         });
//     });

//     describe("Withdraw", function () {
//         it("Only owner should withdraw tokens", async function () {
//             await erc721.mint(addr1.getAddress(), 1);
//             await erc721.connect(addr1).approve(escrowERC721.getAddress(), 1);
//             await escrowERC721.connect(addr1).deposit(1);

//             await expect(escrowERC721.connect(addr1).withdraw([1])).to.be.revertedWith("Ownable: caller is not the owner");
//             await escrowERC721.connect(owner).withdraw([1]);

//             expect(await erc721.ownerOf(1)).to.equal(await addr1.getAddress());
//         });

//         it("Should revert when trying to withdraw an unstaked token", async function () {
//             await expect(escrowERC721.connect(owner).withdraw([1])).to.be.revertedWith("Token is not staked.");
//         });

//         it("Should not allow withdrawal of non-existent token", async function () {
//             await expect(escrowERC721.connect(owner).withdraw([9999])).to.be.reverted; // Add expected revert reason.
//         });

//         it("Should handle multiple withdrawals in sequence", async function () {
//             await erc721.mint(addr1.getAddress(), 1);
//             await erc721.connect(addr1).approve(escrowERC721.getAddress(), 1);
//             await escrowERC721.connect(addr1).deposit(1);

//             await escrowERC721.connect(owner).withdraw([1]);
//             expect(await erc721.ownerOf(1)).to.equal(await addr1.getAddress());
//             await expect(escrowERC721.connect(owner).withdraw([1])).to.be.reverted; // Add expected revert reason for trying to withdraw already withdrawn token.
//         });

//         it("Should handle deposit and withdrawal of large number of tokens", async function () {
//             const tokenIds: number[] = [];
//             for (let i = 0; i < 100; i++) {
//                 await erc721.mint(addr1.getAddress(), i);
//                 await erc721.connect(addr1).approve(escrowERC721.getAddress(), i);
//                 await escrowERC721.connect(addr1).deposit(i);
//                 tokenIds.push(i);
//             }

//             expect(await escrowERC721.balanceOf(addr1.getAddress())).to.equal(100);

//             await escrowERC721.connect(owner).withdraw(tokenIds);

//             // Check that all tokens are now owned by addr1 again after withdrawal
//             for (let i = 0; i < 100; i++) {
//                 expect(await erc721.ownerOf(i)).to.equal(await addr1.getAddress());
//             }

//             // Check that addr1's balance in the escrow is 0 after withdrawal
//             expect(await escrowERC721.balanceOf(addr1.getAddress())).to.equal(0);
//         });

//         describe("Multiple User Operations", function () {

//             it("Multiple users should deposit and owner should withdraw on their behalf", async function () {
//                 const addr1TokenIds: number[] = [];
//                 const addr2TokenIds: number[] = [];
//                 const numberOfTokens = 10; // Per user

//                 // User 1 deposits
//                 for (let i = 1; i <= numberOfTokens; i++) {
//                     await erc721.mint(addr1.getAddress(), i);
//                     await erc721.connect(addr1).approve(escrowERC721.getAddress(), i);
//                     await escrowERC721.connect(addr1).deposit(i);
//                     addr1TokenIds.push(i);

//                     expect(await escrowERC721.stakedTokens(i)).to.equal(await addr1.getAddress());
//                     expect(await erc721.ownerOf(i)).to.equal(await escrowERC721.getAddress());
//                 }

//                 // User 2 deposits
//                 for (let i = numberOfTokens + 1; i <= 2 * numberOfTokens; i++) {
//                     await erc721.mint(addr2.getAddress(), i);
//                     await erc721.connect(addr2).approve(escrowERC721.getAddress(), i);
//                     await escrowERC721.connect(addr2).deposit(i);
//                     addr2TokenIds.push(i);

//                     expect(await escrowERC721.stakedTokens(i)).to.equal(await addr2.getAddress());
//                     expect(await erc721.ownerOf(i)).to.equal(await escrowERC721.getAddress());
//                 }

//                 expect(await escrowERC721.balanceOf(addr1.getAddress())).to.equal(numberOfTokens);
//                 expect(await escrowERC721.balanceOf(addr2.getAddress())).to.equal(numberOfTokens);

//                 // Owner withdraws on behalf of User 1
//                 await escrowERC721.connect(owner).withdraw(addr1TokenIds);
//                 for (let i of addr1TokenIds) {
//                     expect(await erc721.ownerOf(i)).to.equal(await addr1.getAddress());
//                 }

//                 // Check that addr1's balance in the escrow is 0 after withdrawal
//                 expect(await escrowERC721.balanceOf(addr1.getAddress())).to.equal(0);

//                 // Owner withdraws on behalf of User 2
//                 await escrowERC721.connect(owner).withdraw(addr2TokenIds);
//                 for (let i of addr2TokenIds) {
//                     expect(await erc721.ownerOf(i)).to.equal(await addr2.getAddress());
//                 }

//                 // Check that addr2's balance in the escrow is 0 after withdrawal
//                 expect(await escrowERC721.balanceOf(addr2.getAddress())).to.equal(0);
//             });
//         });

//     });

//     describe("Approval", function () {
//         it("Should not deposit without approval", async function () {
//             await erc721.mint(addr1.getAddress(), 1);
//             await expect(escrowERC721.connect(addr1).deposit(1)).to.be.reverted; // Add the expected revert reason if possible.
//         });
//     });

//     describe("Events", function () {
//         it("Should emit Deposited event when a token is deposited", async function () {
//             await erc721.mint(addr1.getAddress(), 1);
//             await erc721.connect(addr1).approve(escrowERC721.getAddress(), 1);
//             await expect(escrowERC721.connect(addr1).deposit(1))
//                 .to.emit(escrowERC721, "Deposited")
//                 .withArgs(await addr1.getAddress(), 1);
//         });

//         it("Should emit Withdrawn event when a token is withdrawn", async function () {
//             await erc721.mint(addr1.getAddress(), 1);
//             await erc721.connect(addr1).approve(escrowERC721.getAddress(), 1);
//             await escrowERC721.connect(addr1).deposit(1);
//             await expect(escrowERC721.connect(owner).withdraw([1]))
//                 .to.emit(escrowERC721, "Withdrawn")
//                 .withArgs(await addr1.getAddress(), 1);
//         });

//     });
// });

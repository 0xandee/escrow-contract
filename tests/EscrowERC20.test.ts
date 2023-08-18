// import { expect } from "chai";
// import { ethers } from "hardhat";
// import { EscrowERC20, ERC20Mock } from "../types";
// import { Signer } from "ethers";

// describe("EscrowERC20", function () {
//     let token: ERC20Mock;
//     let escrowERC20: EscrowERC20;
//     let owner: Signer;
//     let addr1: Signer;
//     let addr2: Signer;

//     beforeEach(async function () {
//         const ERC20MockFactory = await ethers.getContractFactory("ERC20Mock");
//         token = (await ERC20MockFactory.deploy("TestToken", "TT", ethers.parseEther("1000"))) as ERC20Mock;

//         const EscrowERC20Factory = await ethers.getContractFactory("EscrowERC20");
//         escrowERC20 = (await EscrowERC20Factory.deploy(token.getAddress())) as EscrowERC20;

//         [owner, addr1, addr2] = await ethers.getSigners();

//         // Giving some initial tokens to addr1 and addr2 for testing
//         await token.transfer(addr1.getAddress(), ethers.parseEther("100"));
//         await token.transfer(addr2.getAddress(), ethers.parseEther("100"));
//     });

//     describe("Deposit", function () {
//         it("Should deposit the token into the escrow", async function () {
//             await token.connect(addr1).approve(escrowERC20.getAddress(), ethers.parseEther("50"));
//             await escrowERC20.connect(addr1).deposit(ethers.parseEther("50"));

//             expect(await escrowERC20.balanceOf(addr1.getAddress())).to.equal(ethers.parseEther("50"));
//             expect(await token.balanceOf(escrowERC20.getAddress())).to.equal(ethers.parseEther("50"));
//         });

//         it("Should revert when depositing 0 amount", async function () {
//             await expect(escrowERC20.connect(addr1).deposit(0)).to.be.revertedWith("Amount should be greater than 0");
//         });
//     });

//     describe("Withdraw", function () {
//         it("Only owner should withdraw tokens", async function () {
//             await token.connect(addr1).approve(escrowERC20.getAddress(), ethers.parseEther("50"));
//             await escrowERC20.connect(addr1).deposit(ethers.parseEther("50"));

//             const beneficiaries = [await addr1.getAddress()];
//             const amounts = [ethers.parseEther("50")];

//             await expect(escrowERC20.connect(addr1).withdraw(beneficiaries, amounts))
//                 .to.be.revertedWith("Ownable: caller is not the owner");

//             await escrowERC20.connect(owner).withdraw(beneficiaries, amounts);
//             expect(await token.balanceOf(addr1.getAddress())).to.equal(ethers.parseEther("100"));
//         });

//         it("Should revert when trying to withdraw more than the balance", async function () {
//             const beneficiaries = [await addr1.getAddress()];
//             const amounts = [ethers.parseEther("50")];

//             await expect(escrowERC20.connect(owner).withdraw(beneficiaries, amounts))
//                 .to.be.revertedWith("Not enough balance for the beneficiary");
//         });

//         it("Should handle withdrawal for multiple beneficiaries", async function () {
//             await token.connect(addr1).approve(escrowERC20.getAddress(), ethers.parseEther("50"));
//             await token.connect(addr2).approve(escrowERC20.getAddress(), ethers.parseEther("30"));

//             await escrowERC20.connect(addr1).deposit(ethers.parseEther("50"));
//             await escrowERC20.connect(addr2).deposit(ethers.parseEther("30"));

//             const beneficiaries = [await addr1.getAddress(), await addr2.getAddress()];
//             const amounts = [ethers.parseEther("40"), ethers.parseEther("20")];

//             await escrowERC20.connect(owner).withdraw(beneficiaries, amounts);

//             expect(await token.balanceOf(addr1.getAddress())).to.equal(ethers.parseEther("90"));
//             expect(await token.balanceOf(addr2.getAddress())).to.equal(ethers.parseEther("90"));
//         });

//         it("Should revert when beneficiaries and amounts arrays lengths mismatch", async function () {
//             const beneficiaries = [await addr1.getAddress()];
//             const amounts = [ethers.parseEther("40"), ethers.parseEther("20")];

//             await expect(escrowERC20.connect(owner).withdraw(beneficiaries, amounts))
//                 .to.be.revertedWith("Input array lengths must match");
//         });
//     });

//     describe("Edge Cases", function () {
//         it("Should revert when trying to deposit without approval", async function () {
//             await expect(escrowERC20.connect(addr1).deposit(ethers.parseEther("50")))
//                 .to.be.reverted;  // You can add a specific revert message if your contract provides one
//         });

//         it("Should revert when trying to deposit more tokens than owned", async function () {
//             await token.connect(addr1).approve(escrowERC20.getAddress(), ethers.parseEther("200"));
//             await expect(escrowERC20.connect(addr1).deposit(ethers.parseEther("200")))
//                 .to.be.reverted;  // Again, a specific message can be checked if your contract provides one
//         });
//     });

//     describe("Events", function () {
//         it("Should emit Deposited event on deposit", async function () {
//             await token.connect(addr1).approve(escrowERC20.getAddress(), ethers.parseEther("50"));

//             await expect(escrowERC20.connect(addr1).deposit(ethers.parseEther("50")))
//                 .to.emit(escrowERC20, "Deposited")
//                 .withArgs(await addr1.getAddress(), ethers.parseEther("50"));
//         });

//         it("Should emit Withdrawn event on withdrawal", async function () {
//             await token.connect(addr1).approve(escrowERC20.getAddress(), ethers.parseEther("50"));
//             await escrowERC20.connect(addr1).deposit(ethers.parseEther("50"));

//             const beneficiaries = [await addr1.getAddress()];
//             const amounts = [ethers.parseEther("50")];

//             await expect(escrowERC20.connect(owner).withdraw(beneficiaries, amounts))
//                 .to.emit(escrowERC20, "Withdrawn")
//                 .withArgs(await addr1.getAddress(), ethers.parseEther("50"));
//         });

//         it("Should emit multiple Withdrawn events for multiple withdrawals", async function () {
//             await token.connect(addr1).approve(escrowERC20.getAddress(), ethers.parseEther("50"));
//             await token.connect(addr2).approve(escrowERC20.getAddress(), ethers.parseEther("30"));

//             await escrowERC20.connect(addr1).deposit(ethers.parseEther("50"));
//             await escrowERC20.connect(addr2).deposit(ethers.parseEther("30"));

//             const beneficiaries = [await addr1.getAddress(), await addr2.getAddress()];
//             const amounts = [ethers.parseEther("40"), ethers.parseEther("20")];

//             await expect(escrowERC20.connect(owner).withdraw(beneficiaries, amounts))
//                 .to.emit(escrowERC20, "Withdrawn")
//                 .withArgs(await addr1.getAddress(), ethers.parseEther("40"))
//                 .and.to.emit(escrowERC20, "Withdrawn")
//                 .withArgs(await addr2.getAddress(), ethers.parseEther("20"));
//         });
//     });

// });

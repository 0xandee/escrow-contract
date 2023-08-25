import { ethers, upgrades } from "hardhat";
import { expect } from "chai";

describe("EscrowERC20", function () {
    let owner, addr1, addr2, erc20, escrowERC20;

    beforeEach(async () => {
        // Deploy a mock ERC20 token for the tests
        const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        erc20 = await ERC20Mock.deploy("TestToken", "TT", 1000000);

        // Deploy the EscrowERC20 contract
        const EscrowERC20 = await ethers.getContractFactory("EscrowERC20");
        // escrowERC20 = await EscrowERC20.deploy();
        escrowERC20 = await upgrades.deployProxy(EscrowERC20, { initializer: 'initialize' });

        [owner, addr1, addr2] = await ethers.getSigners();
        // Transfer some tokens to addr1
        await erc20.transfer(await addr1.getAddress(), 1000);
    });

    describe("deposit", function () {
        it("Should deposit ERC20 tokens to the escrow", async () => {
            // Approve the escrow to spend addr1's tokens
            await erc20.connect(addr1).approve(await escrowERC20.getAddress(), 500);

            // Deposit to the escrow
            await expect(escrowERC20.connect(addr1).deposit(await erc20.getAddress(), 500))
                .to.emit(escrowERC20, "DepositedERC20")
                .withArgs(await addr1.getAddress(), await erc20.getAddress(), 500);

            expect(await erc20.balanceOf(await escrowERC20.getAddress())).to.equal(500);
        });
    });

    describe("withdraw", function () {
        it("Only owner can withdraw ERC20 tokens from the escrow", async () => {
            await erc20.connect(addr1).approve(escrowERC20.getAddress(), 500);
            await escrowERC20.connect(addr1).deposit(erc20.getAddress(), 500);

            // Try withdrawing as addr1 (should fail)
            await expect(
                escrowERC20.connect(addr1).withdraw(
                    [erc20.getAddress()],
                    [500],
                    [addr1.getAddress()]
                )
            ).to.be.revertedWith("Ownable: caller is not the owner");

            // Owner should be able to withdraw
            await expect(escrowERC20.withdraw(
                [await erc20.getAddress()],
                [500],
                [await addr1.getAddress()]
            ))
                .to.emit(escrowERC20, "WithdrawnERC20")
                .withArgs(await addr1.getAddress(), await erc20.getAddress(), 500);

            expect(await erc20.balanceOf(await escrowERC20.getAddress())).to.equal(0);
        });
    });

    describe("Events", function () {
        it("Should emit DepositedERC20 event when ERC20 tokens are deposited", async () => {
            await erc20.connect(addr1).approve(escrowERC20.getAddress(), 500);
            await expect(escrowERC20.connect(addr1).deposit(await erc20.getAddress(), 500))
                .to.emit(escrowERC20, "DepositedERC20")
                .withArgs(await addr1.getAddress(), await erc20.getAddress(), 500);
        });

        it("Should emit WithdrawnERC20 event when ERC20 tokens are withdrawn", async () => {
            await erc20.connect(addr1).approve(escrowERC20.getAddress(), 500);
            await escrowERC20.connect(addr1).deposit(erc20.getAddress(), 500);

            await expect(escrowERC20.withdraw(
                [erc20.getAddress()],
                [500],
                [addr1.getAddress()]
            ))
                .to.emit(escrowERC20, "WithdrawnERC20")
                .withArgs(await addr1.getAddress(), await erc20.getAddress(), 500);
        });
    });
});

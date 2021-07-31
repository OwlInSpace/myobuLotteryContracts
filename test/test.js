const { expect } = require("chai");
const secrets = require("../secrets.json");

const clearLastLine = () => {
  process.stdout.moveCursor(0, -1); // up one line
  process.stdout.clearLine(1); // from cursor to end
};

var linkToken;
var contract;
var signer;
let burn = "0x000000000000000000000000000000000000dEaD";

var provider = ethers.getDefaultProvider("rinkeby", {
  infura: secrets.infuraApiKey,
  etherscan: secrets.etherscanApiKey,
});

ethers.getSigner().then((s) => {
  signer = s;
  linkToken = ethers
    .getContractAt(
      "contracts/Interfaces/IERC20.sol:IERC20",
      "0x01BE23585060835E02B77ef475b0Cc51aA1e0709",
      signer
    )
    .then((c) => {
      linkToken = c;
    });
});

describe("Contract deployment", function () {
  // Deloy the contract
  it("Deploy Contract", async function () {
    const Contract = await ethers.getContractFactory("MyobuLottery");
    contract = await Contract.deploy();
    await contract.deployed();
  });

  // Transfer 1 LINK for oracle gas
  it("Transfer 1 LINK", async function () {
    let tx = await linkToken.transfer(contract.address, (1e18).toString());
    await tx.wait();
  });
});

describe("Test lottery 1", function () {
  it("Create lottery", async function () {
    let tx = await contract.createLottery(
      45,
      (0.05e18).toString(),
      1000,
      1000,
      1,
      1, 
      0
    );
    await tx.wait();
    expect(await contract.currentLotteryID()).to.equal(1);
  });

  // No lottery should be able to be created after one is in progress
  it("New lottery cannot be created after one is in progress", async function () {
    try {
      await contract.createLottery(45, (0.05e18).toString(), 1000, 1000, 1, 1, 0);
    } catch (e) {
      return;
    }
    throw new Error("Didn't revert");
  });

  // Buys 11 tickets
  it("Buy 11 Tickets", async function () {
    let tx = await contract.buyTickets({ value: (0.55e18).toString() });
    await tx.wait();
    expect(await contract.balanceOf(signer.address)).to.equal(11);
  });

  it("Claim Fees", async function () {
    let oldBalance = await provider.getBalance(burn);
    let tx = await contract.claimFees();
    await tx.wait();
    let expectedNumber = ethers.BigNumber.from((0.55e18 / 10).toString());
    expect(await provider.getBalance(burn)).to.equal(
      oldBalance.add(expectedNumber)
    );
  });

  it("Claim Fees doesn't send more after all have been claimed", async function () {
    let oldBalance = await provider.getBalance(burn);
    let tx = await contract.claimFees();
    await tx.wait();
    expect(await provider.getBalance(burn)).to.equal(oldBalance);
  });

  it("Claim Reward", async function () {
    let tx = await contract.claimReward();
    await tx.wait();
  });

  it("Claim Reward cannot be called again", async function () {
    try {
      await contract.claimReward();
    } catch (e) {
      return;
    }
    throw new Error("Did not revert");
  });

  // Checks if ETH has been sent and enough has been kept for next lottery
  it("Reward is sent correctly", async function () {
    // If the oracle takes more than 120 seconds, then it probably failed
    this.timeout(120e3);
    console.log("    ◌ Waiting for oracle response");
    let oldBalance = await provider.getBalance(signer.address);
    return new Promise((resolve) => {
      contract.on("LotteryWon", async function (a, b, c) {
        clearLastLine();
        console.log("    ✓ Oracle Responded");
        let expectedNumber = ethers.BigNumber.from(
          (0.55e18 - 0.55e18 / 5).toString()
        );
        if (a != signer.address || b.toString() != expectedNumber) {
          console.log(`Returned: ${a} and ${b.toString()}`);
          console.log(`Expected: ${signer.address} and ${expectedNumber}`);
          throw new Error("Bad event listener");
        }
        expect(await provider.getBalance(signer.address)).to.equal(
          oldBalance.add(expectedNumber).toString()
        );
        expect(await provider.getBalance(contract.address)).to.equal(
          ethers.BigNumber.from((0.55e18 / 10).toString())
        );
        resolve();
      });
    });
  });

  it("Claim Reward cannot be called after reward is given", async function () {
    try {
      await contract.claimReward();
    } catch (e) {
      return;
    }
    throw new Error("Did not revert");
  });
});

describe("Test lottery 2", function () {
  it("Start Lottery", async function () {
    let tx = await contract.createLottery(
      45,
      (0.05e18).toString(),
      1000,
      1000,
      (100000000000e9).toString(),
      (250000000000e9).toString(),
      0
    );
    await tx.wait();
    expect(await contract.currentLotteryID()).to.equal(2);
  });

  it("Extend current lottery", async function () {
    let oldLotto = await contract.lottery(2);
    let oldTime = oldLotto[2].toNumber();
    let tx = await contract.extendCurrentLottery(50);
    await tx.wait();
    let lotto = await contract.lottery(2);
    let time = lotto[2].toNumber();
    expect(time).to.equal(oldTime + 50);
  });

  it("Fail if extend lottery makes the lottery time longer than 1 month", async function () {
    try {
      await contract.extendCurrentLottery(2629650);
    } catch (e) {
      return;
    }
    throw new Error("Didn't revert");
  });

  it("Buy 1 ticket", async function () {
    let tx = await contract.buyTickets({ value: (0.05e18).toString() });
    await tx.wait();
    expect(await contract.balanceOf(signer.address)).to.equal(12);
  });

  it("Fail to buy tickets if not enough ETH is sent", async function () {
    try {
      await contract.buyTickets({ value: (0.04e18).toString() });
    } catch (e) {
      return;
    }
    throw new Error("Didn't revert");
  });

  it("Fail if not enough myobu for ticket buy", async function () {
    try {
      await contract.buyTickets({ value: (0.2e18).toString() });
    } catch (e) {
      return;
    }
    throw new Error("Didn't revert");
  });
});

describe("Other functions", function () {
  it("Recover 0.5 LINK", async function () {
    let oldBalance = await linkToken.balanceOf(signer.address);
    let tx = await contract.recoverLINK((0.5e18).toString());
    await tx.wait();
    expect(await linkToken.balanceOf(signer.address)).to.equal(
      oldBalance.add(ethers.BigNumber.from((0.5e18).toString()))
    );
  });

  it("Fails on transfer", async function () {
    try {
      await contract.transferFrom(signer.address, burn, 1);
    } catch (e) {
      return;
    }
    throw new Error("Didn't revert");
  });
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Tests for the rinkeby network.
// NOTE: This will 99% fail if not done on rinkeby

describe("Myobu Lottery Contract", function() {
  var linkToken;
  var contract;
  ethers.getSigner().then((signer) => {
    linkToken = ethers.getContractAt("contracts/Interfaces/IERC20.sol:IERC20", "0x01BE23585060835E02B77ef475b0Cc51aA1e0709", signer).then((c) => {
      linkToken = c;
    });
  });
  it("Deploy Contract", async function() {
    const Contract = await ethers.getContractFactory("MyobuLottery");
    contract = await Contract.deploy();  
    await contract.deployed();
  });
  it("Create lottery", async function() {
    let tx = await contract.createLottery(45, 0.05e18.toString(), 1000, 1, 1000);
    await tx.wait();
  })
  it("Buy 11 Tickets", async function () {
    let tx = await contract.buyTickets({value: 0.55e18.toString()});
    await tx.wait();
  }) 
  it("Claim Fees", async function() {
    let tx = await contract.claimFees();
    await tx.wait();
  })
  it("Transfer 1 LINK", async function() {
    let tx = await linkToken.transfer(contract.address, 1e18.toString());
    await tx.wait();
  })
  it("Claim Reward", async function() {
    let tx = await contract.claimReward();
    await tx.wait();
  })
  it ("Start new Lottery", async function() {
    // Wait for oracle response
    await sleep(85e3);
    let tx = await contract.createLottery(10000, 0.05e18.toString(), 1000, 1, 1000);
    await tx.wait();
  })
  it ("Buy 1 ticket on the new lottery", async function () {
    let tx = await contract.buyTickets({value: 0.05e18.toString()});
    await tx.wait();
  })
});

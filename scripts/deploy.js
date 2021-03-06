const hre = require("hardhat");

async function main() {
  console.log("NOTE: Before deploying to mainnet: change the chainlink, myobu and WETH contract addresses\n\nDeploying lottery contract..");
  const Contract = await hre.ethers.getContractFactory("MyobuLottery");
  const contract = await Contract.deploy();
  console.log(`\nDeploy transaction: https://etherscan.io/tx/${contract.deployTransaction.hash}`);
  await contract.deployed();
  console.log(`\nContract: https://etherscan.io/address/${contract.address}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

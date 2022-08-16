// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
// const hre = require("hardhat");

async function main() {
    // Fetch contract to deploy
    const Token = await ethers.getContractFactory("Token")
    // Deploy contract
    const token = await Token.deploy()  // NOTE: "await" means wait to finish b/f next step.
    await token.deployed()  // "deployed()" gets the information that was deployed and loaded into our Smart Contract
    console.log(`Token deployed to: ${token.address}`)  // Logs Token address as a string to the console whenever it's deployed.
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
// Runs the "main" function, then catches any errors & logs to the console.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

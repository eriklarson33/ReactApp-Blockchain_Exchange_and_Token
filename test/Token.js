const { expect } = require('chai');  // import chai library.
const { ethers } = require('hardhat'); // import ethers library from the hardhat library.

// describe() is a function provided by the hardhat test runner...
// It's a wrapper that you add a string to describe what you're doing and then the function runs all the tests.
describe("Token", ()=> {
    // Tests go inside here...
    // "it" is used for each test example. 1st argument is a describing string, 2nd is a function
    it("has a name", async()=> {
        // Fetch Token Smart Contract from the blockchain with ethers.js...
        // NOTE: to call await, it needs to be inside of an async (asynchronous) function.
        const Token = await ethers.getContractFactory('Token') // Gets the contract itself
        let token = await Token.deploy() // Gets the deployed copy of the contract
        // Read the token name.
        const name = await token.name
        // Check that the name is correct, using Chai
        expect(name).to.equal("My Token")
    })
}) 
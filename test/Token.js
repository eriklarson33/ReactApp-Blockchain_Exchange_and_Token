const { expect } = require('chai');  // import chai library.
const { ethers } = require('hardhat'); // import ethers library from the hardhat library.

const tokens = (n)=> {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

// describe() is a function provided by the hardhat test runner...
// It's a wrapper that you add a string to describe what you're doing and then the function runs all the tests.
describe("Token", ()=> {
    // Declare Token variable so that it's accessible to all funcitons. NOTE: Can make all declarations in 1 line.
    let token, 
        accounts, 
        deployer
    // let accounts
    // let deployer

    // beforeEach function executes code before each of the following test functions.
    beforeEach( async ()=> {
        // Fetch Token Smart Contract from the blockchain with ethers.js...
        // NOTE: to call await, it needs to be inside of an async (asynchronous) function.
        const Token = await ethers.getContractFactory('Token') // Gets the contract itself
        token = await Token.deploy('My Token', 'TOK', '1000000') // Gets the deployed copy of the contract
        accounts = await ethers.getSigners() // Get an array of Test Accounts
        deployer = accounts[0] // Get the 1st account as the deploying account.
    })

    describe('Deployment', ()=> {
        const name = 'My Token'
        const symbol = 'TOK'
        const decimals = '18'
        const totalSupply = tokens('1000000')

        // "it" is used for each test example. 1st argument is a describing string, 2nd is a function
        it("has the correct name", async()=> {
            // Read the token name.
            const token_name = await token.name()
            // Check that the name is correct, using Chai
            expect(token_name).to.equal(name)
        })

        // running a test in one readable line...
        it('has the correct symbol', async()=> {
            expect(await token.symbol()).to.equal(symbol)
        })

        it('has the correct # of decimals.', async()=> {
            expect(await token.decimals()).to.equal(decimals)
        })

        it('has corrrect total supply.', async()=> {
            expect(await token.totalSupply()).to.equal(totalSupply)
        })

        it('assigns Total Supply to contract deployer', async()=> {
            expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
        })
    })
}) 
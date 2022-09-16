const { expect } = require('chai');  // import chai library.
const { ethers } = require('hardhat'); // import ethers library from the hardhat library.

const tokens = (n)=> {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("Exchange", ()=> {
    let deployer, feeAccount, exchange

    const feePercent = 10

    // beforeEach function executes code before each of the following test functions.
    beforeEach( async ()=> {
        // Fetch Token Smart Contract from the blockchain with ethers.js...
        // NOTE: to call await, it needs to be inside of an async (asynchronous) function.
        
        accounts = await ethers.getSigners() // Get an array of Test Accounts
        deployer = accounts[0] // Get the 1st account as the deploying account.
        feeAccount = accounts[1] // Account holding collected fees 

        const Exchange = await ethers.getContractFactory('Exchange') // Gets the contract itself
        exchange = await Exchange.deploy(feeAccount.address, feePercent) // Gets the deployed copy of the contract
    })

    describe('Deployment', ()=> {

        it("tracks the fee account", async()=> {
            expect(await exchange.feeAccount()).to.equal(feeAccount.address)
        })

        it('tracks the fee percent', async()=> {
            expect(await exchange.feePercent()).to.equal(feePercent)
        })
    })
}) 
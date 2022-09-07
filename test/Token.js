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
        receiver = accounts[1]
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

    describe('Sending Tokens', ()=> {
        let amount, transaction, result

        describe('Success', ()=>{
            beforeEach(async ()=> {
                amount = tokens(100)
    
                // Transfer tokens, take the deployer wallet and connect it to the contract to be able to sign transactions
                transaction = await token.connect(deployer).transfer(receiver.address , amount)
                result = await transaction.wait()
            })
    
            it('transfers token balances', async()=> {
                // Log balance before transfer
                console.log('deployer balance before transfer', await token.balanceOf(deployer.address))
                console.log('receiver balance before transfer', await token.balanceOf(receiver.address))
    
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
                expect(await token.balanceOf(receiver.address)).to.equal(amount)
    
                // Log balance after transfer.
                console.log('deployer balance before transfer', await token.balanceOf(deployer.address))
                console.log('receiver balance before transfer', await token.balanceOf(receiver.address))
                // Ensure tokens were transfered, balance change.
            })
    
            it('emits a Transfer event', async()=> {
                const event = result.events[0]
                // console.log(event)
                expect(event.event).to.equal('Transfer')
    
                const args = event.args
                expect(args.from).to.equal(deployer.address)
                expect(args.to).to.equal(receiver.address)
                expect(args.value).to.equal(amount)
            })
        })

        describe('Failure', ()=> {
            it('rejects insufficient balances', async ()=> {
                // Transfers more tokens than the deployer has. (100M)
                const invalidAmount = tokens(10000000 )
                // Transfer tokens, take the deployer wallet and connect it to the contract to be able to sign transactions
                // Below uses "waffle" for blockchain specific commands (like "reverted")
                await expect(token.connect(deployer).transfer(receiver.address , invalidAmount)).to.be.reverted
            })

            it('rejects invalid recipient address', async ()=> {
                const amount = tokens(100)
                await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
            })
        })

        
    })
}) 
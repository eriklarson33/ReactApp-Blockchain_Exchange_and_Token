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
        const Exchange = await ethers.getContractFactory('Exchange') // Gets the contract itself
        const Token = await ethers.getContractFactory('Token')

        token1 = await Token.deploy('My Token', 'TOK', '1000000')
        token2 = await Token.deploy('Mock Dai', 'mDAI', '1000000')
        
        accounts = await ethers.getSigners() // Get an array of Test Accounts
        deployer = accounts[0] // Get the 1st account as the deploying account.
        feeAccount = accounts[1] // Account holding collected fees 
        user1 = accounts[2]

        // Transfer tokens to the test user1
        let transaction = await token1.connect(deployer).transfer(user1.address, tokens(100))
        await transaction.wait()  // wait for the transaction to occur.

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

    describe('Depositing Tokens into Exchange', async ()=> {
        let transaction, result
        let amount = tokens(10)

        
        describe('Success', ()=> {
            beforeEach(async ()=>{
                // console.log(user1.address, exchange.address, amount.toString())
                // Approve Tokens to be deposited on behalf of user
                transaction = await token1.connect(user1).approve(exchange.address, amount)
                result = await transaction.wait()
                // Deposit Tokens
                transaction = await exchange.connect(user1).depositToken(token1.address, amount)
                result = await transaction.wait()
            })

            it('tracks the token deposit', async()=> {
                expect(await token1.balanceOf(exchange.address)).to.equal(amount)
                expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)
                expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
            })

            it('emits a Deposit event', async() => {
                const event = result.events[1] // 2 events have been emitted
                expect(event.event).to.equal('Deposit')

                const args = event.args
                expect(args.token).to.equal(token1.address)
                expect(args.user).to.equal(user1.address)
                expect(args.amount).to.equal(amount)
                expect(args.balance).to.equal(amount)
            })
        })
        describe('Failure', ()=> {
            it('fails when no tokens are approved', async ()=>{
                // Attempt to deposit tokens without going through Approval function first.
                await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
            })
        })
    })

    describe('Withdrawing Tokens from Exchange', async ()=> {
        let transaction, result
        let amount = tokens(10)

        
        describe('Success', ()=> {
            beforeEach(async ()=>{
                // Deposit Tokens before withdrawingx
                // Approve Tokens to be deposited on behalf of user
                transaction = await token1.connect(user1).approve(exchange.address, amount)
                result = await transaction.wait()
                // Deposit Tokens
                transaction = await exchange.connect(user1).depositToken(token1.address, amount)
                result = await transaction.wait()

                // Now, Withdraw the Tokens
                transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
                result = await transaction.wait()
            })

            it('withdraws the token funds', async()=> {
                expect(await token1.balanceOf(exchange.address)).to.equal(0)
                expect(await exchange.tokens(token1.address, user1.address)).to.equal(0)
                expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0)
            })

            it('emits a Withdraw event', async() => {
                const event = result.events[1] // 2 events have been emitted
                expect(event.event).to.equal('Withdraw')

                const args = event.args
                expect(args.token).to.equal(token1.address)
                expect(args.user).to.equal(user1.address)
                expect(args.amount).to.equal(amount)
                expect(args.balance).to.equal(0)
            })
        })
        describe('Failure', ()=> {
            it('fails for insufficient funds', async ()=>{
                // Attempt to withdraw tokens without depositing.
                await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted
            })
        })
    })

    describe('Deployment', ()=> {

        it("tracks the fee account", async()=> {
            expect(await exchange.feeAccount()).to.equal(feeAccount.address)
        })

        it('tracks the fee percent', async()=> {
            expect(await exchange.feePercent()).to.equal(feePercent)
        })
    })

    describe('Checking balances', async ()=> {
        let transaction, result
        let amount = tokens(1)
 
        beforeEach(async ()=>{
            // console.log(user1.address, exchange.address, amount.toString())
            // Approve Tokens to be deposited on behalf of user
            transaction = await token1.connect(user1).approve(exchange.address, amount)
            result = await transaction.wait()
            // Deposit Tokens
            transaction = await exchange.connect(user1).depositToken(token1.address, amount)
            result = await transaction.wait()
        })

        it('returns user balance', async()=> {
            expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
        })
    })

    // describe('Making orders', async ()=> {
    //     let transaction, result
    //     let amount = tokens(1)
 
    //     beforeEach(async ()=>{
    //         // console.log(user1.address, exchange.address, amount.toString())
    //         // Approve Tokens to be deposited on behalf of user
    //         transaction = await token1.connect(user1).approve(exchange.address, amount)
    //         result = await transaction.wait()
    //         // Deposit Tokens
    //         transaction = await exchange.connect(user1).depositToken(token1.address, amount)
    //         result = await transaction.wait()
    //     })

    //     it('returns user balance', async()=> {
    //         expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
    //     })
    // })

    describe('Making orders', async ()=> {
        let transaction, result
        let amount = tokens(1)

        
        describe('Success', ()=> {
            beforeEach(async ()=>{
                // Deposit Tokens before making order
                // Approve Token
                transaction = await token1.connect(user1).approve(exchange.address, amount)
                result = await transaction.wait()
                // Deposit Tokens
                transaction = await exchange.connect(user1).depositToken(token1.address, amount)
                result = await transaction.wait()
                // Make Order
                transaction = await exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount)
                result = await transaction.wait()
            })

            it('tracks the newly created order', async()=> {
                expect(await exchange.orderCount()).to.equal(1);
            })

            it('emits an Order event', async() => {
                const event = result.events[0] // 2 events have been emitted
                expect(event.event).to.equal('Order')

                const args = event.args
                expect(args.id).to.equal(1)
                expect(args.user).to.equal(user1.address)
                expect(args.tokenGet).to.equal(token2.address)
                expect(args.amountGet).to.equal(tokens(1))
                expect(args.tokenGive).to.equal(token1.address)
                expect(args.amountGive).to.equal(tokens(1))
                expect(args.timestamp).to.at.least(1) // Timestamp is atleast "1", that means that it's at least set.
            })
        })
        describe('Failure', ()=> {
            it("rejects orders if there isn't enough tokens", async ()=>{
                // Attempt to deposit tokens without going through Approval function first.
                await expect(exchange.connect(user1).makeOrder(token2.address, tokens(1), token1.address, tokens(1))).to.be.reverted
            })
        })
    })
}) 
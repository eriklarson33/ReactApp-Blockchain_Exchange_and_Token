//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol"; // Will let us do console logging inside of our smart contracts during development.

contract Exchange{
    address public feeAccount;
    uint256 public feePercent;

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }
}

/*
What does the exchange need to do?
1. Allow users to Deposit Tokens
2. Allow users to Withdraw Tokens at any time.
3. Allow users to Check Balances
4. Allow users to Make Orders
5. Allow users to Cancel Orders
6. Allow users to Fill Orders (essentially making a trade)
7. Charge Fees to Users
8. Track the Fee Account (aka, the deployer of the contract)
*/
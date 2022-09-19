//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol"; // Will let us do console logging inside of our smart contracts during development.
import "./Token.sol";

contract Exchange{
    address public feeAccount;
    uint256 public feePercent;
    // Maps Token Address to the User Address & how many Tokens that User has.
    mapping(address => mapping(address => uint256)) public tokens;

    // Event to record deposit
    event Deposit(address token, address user, uint256 amount, uint256 balance);

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

// ------------------------------
// DEPOSIT & WITHDRAW TOKENS

    function depositToken(address _token, uint256 _amount) public {
        // Transfer Tokens to the Exchange
        // NOTE: "address(this) gets the address of the current "Exchange" Smart Contract Address
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));

        // Update User Balance
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;

        // Emit an Event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }
    // Check Balances
    function balanceOf(address _token, address _user)
        public
        view
        returns(uint256) {
            return tokens[_token][_user];
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
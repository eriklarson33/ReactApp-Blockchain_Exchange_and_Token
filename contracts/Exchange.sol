//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol"; // Will let us do console logging inside of our smart contracts during development.
import "./Token.sol";

contract Exchange{
    address public feeAccount;
    uint256 public feePercent;
    // Maps Token Address to the User Address & how many Tokens that User has.
    mapping(address => mapping(address => uint256)) public tokens;

    // Trade Orders Mapping
    mapping(uint256 => _Order) public orders;  // Use the Order Id(uint256) to look up the Order

    // Have an Order Timestamp Cache
    uint256 public orderCount;  // Represents the total # of orders that have been created.

    // Event to record deposit
    event Deposit(address token, address user, uint256 amount, uint256 balance);

    // Event to record Withdraw
    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );

    // Event to record Trade Orders
    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

// Using a "struct" to model the Order.
    struct _Order {
        // Attributes of an Order
        uint256 id;  // Unique Identifier for the order (we'll create this ID Manually)
        address user;  // Address of the user who made the order
        address tokenGet; // Address of the token they receive
        uint256 amountGet;  // Amount they receive
        address tokenGive;  // Address of the token they give
        uint256 amountGive;  // Amount they give
        uint256 timestamp;  // When the order was created
    }

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

    function withdrawToken(address _token, uint256 _amount) public {
        // Ensure the User has enough tokens to withdraw.
        require(tokens[_token][msg.sender] >= _amount);

        // Transfer Tokens to the User (msg.sender is the User)
        // NOTE: Can use "Token.transfer(_to, _value);" function b/c exchange already holds the tokens & is the caller of the function.
        Token(_token).transfer(msg.sender, _amount);


        // Update User Balance
        tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;

        // Emit an Event
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    // Check Balances
    function balanceOf(address _token, address _user)
        public
        view
        returns(uint256) {
            return tokens[_token][_user];
        }

    // ---------------------
    // MAKE & CANCEL ORDERS

    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
        orderCount = orderCount + 1;
        // Require Token Balance
        require(balanceOf(_tokenGive, msg.sender) >= _amountGive);

        // Token Give (the token user wants to wants to spend) - Which Token & How Much?
        // Token Get (the token the user wants to receive) - Which Token & How Much?
        orders[orderCount] = _Order(
            orderCount, // ID
            msg.sender, // user
            _tokenGet, // tokenGet
            _amountGet, // amountGet
            _tokenGive, // tokenGive
            _amountGive, // amountGive
            block.timestamp// timestamp (@17:02 minutes)
        );

        // Emit Event
        emit Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
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
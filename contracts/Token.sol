//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol"; // Will let us do console logging inside of our smart contracts during development.

contract Token{
    string public name;
    string public symbol;
    uint256 public decimals = 18;
    uint256 public totalSupply;

    // Track Balances
    mapping(address => uint256) public balanceOf;

    // Create a nested mapping for allowance
    mapping(address => mapping(address => uint256)) public allowance;  
    //mapping(<Owner Address> => mapping(<'Exchange' or 'Spender' address> => <# of Tokens Approved for spending>))
    
    event Transfer(
        address indexed from, address indexed to, uint256 value
    ); // NOTE: "indexed" makes it easier to filter the events based on the "_from" and "_to".

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    constructor(
        string memory _name, 
        string memory _symbol, 
        uint _totalSupply) 
    {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10**decimals);
        balanceOf[msg.sender] = totalSupply;
    }

// function transfer allows you to take $ out of you're own wallet & send to someone else.
    function transfer(address _to, uint256 _value) 
        public 
        returns (bool success) 
    {
        // Require that Sender has enough tokens to spend.
        require(balanceOf[msg.sender] >= _value);
        // Require tokens are being sent to a valid address / Not getting burned.
        require(_to != address(0));

        // Deduct tokens from spender
        balanceOf[msg.sender] = balanceOf[msg.sender] - _value;
        // Credit tokens to receiver
        balanceOf[_to] = balanceOf[_to] + _value;
        //Emit Event
        emit Transfer(msg.sender, _to, _value);
        
        return true;
    }

// function that approves the address allowed to spend our tokens & the amoung (_value) 
        // they are allowed to spend on our behalf.
    function approve(address _spender, uint256 _value) 
        public 
        returns (bool success)
    {
        // Don't want the spender to be the 0 address
        require(_spender != address(0));

        // Access the nesting mapping, allowance 
        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);

        return true;
    }
}
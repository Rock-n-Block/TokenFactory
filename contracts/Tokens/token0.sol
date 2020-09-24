// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract token0 is ERC20, Ownable
{
    constructor(string memory name, string memory symbol, uint8 decimals) public ERC20(name, symbol)
    {
        ERC20._setupDecimals(decimals);
    }
}
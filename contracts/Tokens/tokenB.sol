// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./token0.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";

contract tokenB is token0, ERC20Burnable
{
    constructor(string memory name, string memory symbol, uint8 decimals)
    public
    token0(name, symbol, decimals)
    {
    }
}
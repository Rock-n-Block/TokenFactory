// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./token0.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Capped.sol";

contract tokenC is token0, ERC20Capped
{
    constructor(string memory name, string memory symbol, uint8 decimals, uint256 cap)
    public
    token0(name, symbol, decimals)
    ERC20Capped(cap)
    {
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
    internal
    virtual
    override(ERC20Capped, ERC20)
    {
        ERC20Capped._beforeTokenTransfer(from, to, amount);
    }
}
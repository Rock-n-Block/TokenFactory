// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./token0.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Capped.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol";

contract tokenCP is token0, ERC20Capped, ERC20Pausable
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
    override(ERC20, ERC20Capped, ERC20Pausable)
    {
        ERC20Capped._beforeTokenTransfer(from, to, amount);
        ERC20Pausable._beforeTokenTransfer(from, to, amount);
    }
}
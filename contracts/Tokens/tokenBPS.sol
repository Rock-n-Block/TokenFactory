// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./token0.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Snapshot.sol";

contract tokenBPS is token0, ERC20Burnable, ERC20Pausable, ERC20Snapshot
{
    constructor(string memory name, string memory symbol, uint8 decimals)
    public
    token0(name, symbol, decimals)
    {
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
    internal
    virtual
    override(ERC20, ERC20Pausable, ERC20Snapshot)
    {
        ERC20Pausable._beforeTokenTransfer(from, to, amount);
        ERC20Snapshot._beforeTokenTransfer(from, to, amount);
    }
}
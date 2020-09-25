// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./Tokens/initForth.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract TokenFactoryForth is Ownable
{
    address public TokenFactoryMain = address(0);

    constructor() public {
    }

    modifier onlyMain{
        require(TokenFactoryMain != address(0));
        require(msg.sender == TokenFactoryMain);
        _;
    }

    function setTokenFactoryMain(address _TokenFactoryMain) public onlyOwner {
        TokenFactoryMain = _TokenFactoryMain;
    }

    function createToken
    (
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 cap,
        address tokenOwner
    )
    public
    onlyMain
    returns (address newToken)
    {
        tokenBCSP token = new tokenBCSP(name, symbol, decimals, cap);
        token.transferOwnership(tokenOwner);
        return address(token);
    }
}
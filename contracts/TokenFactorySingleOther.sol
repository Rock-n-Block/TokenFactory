// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./Tokens/initSingleOther.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract TokenFactorySingleOther is Ownable
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
        bool isSnapshot,
        bool isPausable,
        address tokenOwner
    )
    public
    onlyMain
    returns (address newToken)
    {
        if (isSnapshot == true)
        {
            tokenS token = new tokenS(name, symbol, decimals);
            token.transferOwnership(tokenOwner);
            return address(token);
        }
        else if (isPausable == true)
        {
            tokenP token = new tokenP(name, symbol, decimals);
            token.transferOwnership(tokenOwner);
            return address(token);
        }
        else
        {
            token0 token = new token0(name, symbol, decimals);
            token.transferOwnership(tokenOwner);
            return address(token);
        }
    }
}
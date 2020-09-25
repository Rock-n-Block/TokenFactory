// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./Tokens/initSingle_other.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract TokenFactorySingle_other is Ownable
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
        bool isPausable
    )
    public
    onlyMain
    returns (address newToken)
    {
        if (isSnapshot == true)
            return address(new tokenS(name, symbol, decimals));
        else if (isPausable == true)
            return address(new tokenP(name, symbol, decimals));
        else
            return address(new token0(name, symbol, decimals));
    }
}
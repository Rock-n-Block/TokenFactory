// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./Tokens/initDoubleOther.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract TokenFactoryDoubleOther is Ownable
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
        bool isCapped,
        uint256 cap,
        bool isSnapshot,
        bool isPausable,
        address tokenOwner
    )
    public
    onlyMain
    returns (address newToken)
    {
        if (isCapped     == true &&
            isPausable   == true)
        {
            tokenCP token = new tokenCP(name, symbol, decimals, cap);
            token.transferOwnership(tokenOwner);
            return address(token);
        }
        else if (isCapped     == true &&
                 isSnapshot   == true)
        {
            tokenCS token = new tokenCS(name, symbol, decimals, cap);
            token.transferOwnership(tokenOwner);
            return address(token);
        }
        else
        {
            tokenPS token = new tokenPS(name, symbol, decimals);
            token.transferOwnership(tokenOwner);
            return address(token);
        }
    }
}
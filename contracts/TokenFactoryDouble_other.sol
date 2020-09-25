// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./Tokens/initDouble_other.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract TokenFactoryDouble_other is Ownable
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
        bool isPausable
    )
    public
    onlyMain
    returns (address newToken)
    {
        if (isCapped     == true &&
            isPausable   == true)
            return address(new tokenCP(name, symbol, decimals, cap));
        else if (isCapped     == true &&
                 isSnapshot   == true)
            return address(new tokenCS(name, symbol, decimals, cap));
        else
            return address(new tokenPS(name, symbol, decimals));
    }
}
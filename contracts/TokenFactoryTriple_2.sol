// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./Tokens/initTriple_2.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract TokenFactoryTriple_2 is Ownable
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
        bool isBurnable,
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
        if (isBurnable == true &&
            isPausable == true &&
            isSnapshot == true)
        {
            tokenBPS token = new tokenBPS(name, symbol, decimals);
            token.transferOwnership(tokenOwner);
            return address(token);
        }
        else if (isCapped   == true &&
                 isPausable == true &&
                 isSnapshot == true)
        {
            tokenCPS token = new tokenCPS(name, symbol, decimals, cap);
            token.transferOwnership(tokenOwner);
            return address(token);
        }
    }
}
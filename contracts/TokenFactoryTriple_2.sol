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
        bool isPausable
    )
    public
    onlyMain
    returns (address newToken)
    {
        if (isBurnable == true &&
            isPausable == true &&
            isSnapshot == true)
            return address(new tokenBPS(name, symbol, decimals));
        else if (isCapped   == true &&
                 isPausable == true &&
                 isSnapshot == true)
            return address(new tokenCPS(name, symbol, decimals, cap));
    }
}
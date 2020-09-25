// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./Tokens/initDouble_B.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract TokenFactoryDouble_B is Ownable
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
            isCapped   == true)
        {
            tokenBC token = new tokenBC(name, symbol, decimals, cap);
            token.transferOwnership(tokenOwner);
            return address(token);
        }
        else if (isBurnable == true &&
                 isSnapshot == true)
        {
            tokenBS token = new tokenBS(name, symbol, decimals);
            token.transferOwnership(tokenOwner);
            return address(token);
        }
        else if (isBurnable == true &&
                 isPausable == true)
        {
            tokenBP token = new tokenBP(name, symbol, decimals);
            token.transferOwnership(tokenOwner);
            return address(token);
        }
    }
}
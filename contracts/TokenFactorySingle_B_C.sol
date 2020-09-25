// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./Tokens/initSingle_B_C.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract TokenFactorySingle_B_C is Ownable
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
        address tokenOwner
    )
    public
    onlyMain
    returns (address newToken)
    {
        if (isBurnable == true)
        {
            tokenB token = new tokenB(name, symbol, decimals);
            token.transferOwnership(tokenOwner);
            return address(token);
        }
        else if (isCapped   == true)
        {
            tokenC token = new tokenC(name, symbol, decimals, cap);
            token.transferOwnership(tokenOwner);
            return address(token);
        }
    }
}
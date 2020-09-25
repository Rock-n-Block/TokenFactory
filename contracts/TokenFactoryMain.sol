// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "openzeppelin-solidity/contracts/access/Ownable.sol";

import "./TokenFactorySingle_B_C.sol";
import "./TokenFactorySingle_other.sol";
import "./TokenFactoryDouble_B.sol";
import "./TokenFactoryDouble_other.sol";
import "./TokenFactoryTriple_1.sol";
import "./TokenFactoryTriple_2.sol";
import "./TokenFactoryForth.sol";

contract TokenFactoryMain is Ownable
{
    TokenFactorySingle_B_C    public TokenFactorySingle_B_C_addr;
    TokenFactorySingle_other  public TokenFactorySingle_other_addr;
    TokenFactoryDouble_B      public TokenFactoryDouble_B_addr;
    TokenFactoryDouble_other  public TokenFactoryDouble_other_addr;
    TokenFactoryTriple_1      public TokenFactoryTriple_1_addr;
    TokenFactoryTriple_2      public TokenFactoryTriple_2_addr;
    TokenFactoryForth         public TokenFactoryForth_addr;

    address payable public wallet;

    constructor
    (
        address payable _wallet,
        TokenFactorySingle_B_C    _TokenFactorySingle_B_C_addr,
        TokenFactorySingle_other  _TokenFactorySingle_other_addr,
        TokenFactoryDouble_B      _TokenFactoryDouble_B_addr,
        TokenFactoryDouble_other  _TokenFactoryDouble_other_addr,
        TokenFactoryTriple_1      _TokenFactoryTriple_1_addr,
        TokenFactoryTriple_2      _TokenFactoryTriple_2_addr,
        TokenFactoryForth         _TokenFactoryForth_addr
    )
    public
    {
        wallet = _wallet;
        TokenFactorySingle_B_C_addr = _TokenFactorySingle_B_C_addr;
        TokenFactorySingle_other_addr = _TokenFactorySingle_other_addr;
        TokenFactoryDouble_B_addr = _TokenFactoryDouble_B_addr;
        TokenFactoryDouble_other_addr = _TokenFactoryDouble_other_addr;
        TokenFactoryTriple_1_addr = _TokenFactoryTriple_1_addr;
        TokenFactoryTriple_2_addr = _TokenFactoryTriple_2_addr;
        TokenFactoryForth_addr = _TokenFactoryForth_addr;
    }

    function changeWalet(address payable newWallet) public onlyOwner{
        wallet = newWallet;
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
    payable
    returns (address newToken)
    {
        wallet.transfer(msg.value);
        if (isSingle_B_C(isBurnable, isCapped, isSnapshot, isPausable) == true)
            return address(TokenFactorySingle_B_C_addr.createToken(name,
                                                                   symbol,
                                                                   decimals,
                                                                   isBurnable,
                                                                   isCapped,
                                                                   cap,
                                                                   tokenOwner));
        if (isSingle_other(isBurnable, isCapped, isSnapshot, isPausable) == true)
            return address(TokenFactorySingle_other_addr.createToken(name,
                                                                     symbol,
                                                                     decimals,
                                                                     isSnapshot,
                                                                     isPausable,
                                                                     tokenOwner));
        if (isDouble_B(isBurnable, isCapped, isSnapshot, isPausable) == true)
            return address(TokenFactoryDouble_B_addr.createToken(name,
                                                                 symbol,
                                                                 decimals,
                                                                 isBurnable,
                                                                 isCapped,
                                                                 cap,
                                                                 isSnapshot,
                                                                 isPausable,
                                                                 tokenOwner));
        if (isDouble_other(isBurnable, isCapped, isSnapshot, isPausable) == true)
            return address(TokenFactoryDouble_other_addr.createToken(name,
                                                                     symbol,
                                                                     decimals,
                                                                     isCapped,
                                                                     cap,
                                                                     isSnapshot,
                                                                     isPausable,
                                                                     tokenOwner));
        if (isTriple_1(isBurnable, isCapped, isSnapshot, isPausable) == true)
            return address(TokenFactoryTriple_1_addr.createToken(name,
                                                                 symbol,
                                                                 decimals,
                                                                 isBurnable,
                                                                 isCapped,
                                                                 cap,
                                                                 isSnapshot,
                                                                 isPausable,
                                                                 tokenOwner));
        if (isTriple_2(isBurnable, isCapped, isSnapshot, isPausable) == true)
            return address(TokenFactoryTriple_2_addr.createToken(name,
                                                                 symbol,
                                                                 decimals,
                                                                 isBurnable,
                                                                 isCapped,
                                                                 cap,
                                                                 isSnapshot,
                                                                 isPausable,
                                                                 tokenOwner));
        if (isForth(isBurnable, isCapped, isSnapshot, isPausable) == true)
            return address(TokenFactoryForth_addr.createToken(name,
                                                              symbol,
                                                              decimals,
                                                              cap,
                                                              tokenOwner));
    }

    function isSingle_B_C
    (
        bool isBurnable,
        bool isCapped,
        bool isSnapshot,
        bool isPausable
    )
    private
    pure
    returns (bool)
    {
        if (isBurnable == true  &&
            isCapped   == false &&
            isSnapshot == false &&
            isPausable == false)
            return true;
        if (isBurnable == false &&
            isCapped   == true  &&
            isSnapshot == false &&
            isPausable == false)
            return true;
        return false;
    }

    function isSingle_other
    (
        bool isBurnable,
        bool isCapped,
        bool isSnapshot,
        bool isPausable
    )
    private
    pure
    returns (bool)
    {
        if (isBurnable == false &&
            isCapped   == false &&
            isSnapshot == true  &&
            isPausable == false)
            return true;
        if (isBurnable == false &&
            isCapped   == false &&
            isSnapshot == false &&
            isPausable == true)
            return true;
        return false;
    }

    function isDouble_B
    (
        bool isBurnable,
        bool isCapped,
        bool isSnapshot,
        bool isPausable
    )
    private
    pure
    returns (bool)
    {
        if (isBurnable == true  &&
            isCapped   == true  &&
            isSnapshot == false &&
            isPausable == false)
            return true;
        if (isBurnable == true  &&
            isCapped   == false &&
            isSnapshot == true  &&
            isPausable == false)
            return true;
        if (isBurnable == true  &&
            isCapped   == false &&
            isSnapshot == false &&
            isPausable == true)
            return true;
        return false;
    }

    function isDouble_other
    (
        bool isBurnable,
        bool isCapped,
        bool isSnapshot,
        bool isPausable
    )
    private
    pure
    returns (bool)
    {
        if (isBurnable == false &&
            isCapped   == true  &&
            isSnapshot == true  &&
            isPausable == false)
            return true;
        if (isBurnable == false &&
            isCapped   == true  &&
            isSnapshot == false &&
            isPausable == true)
            return true;
        if (isBurnable == false &&
            isCapped   == false &&
            isSnapshot == true  &&
            isPausable == true)
            return true;
        return false;
    }

    function isTriple_1
    (
        bool isBurnable,
        bool isCapped,
        bool isSnapshot,
        bool isPausable
    )
    private
    pure
    returns (bool)
    {
        if (isBurnable == true  &&
            isCapped   == true  &&
            isSnapshot == true  &&
            isPausable == false)
            return true;
        if (isBurnable == true  &&
            isCapped   == true  &&
            isSnapshot == false &&
            isPausable == true)
            return true;
        return false;
    }

    function isTriple_2
    (
        bool isBurnable,
        bool isCapped,
        bool isSnapshot,
        bool isPausable
    )
    private
    pure
    returns (bool)
    {
        if (isBurnable == true  &&
            isCapped   == false &&
            isSnapshot == true  &&
            isPausable == true)
            return true;
        if (isBurnable == false &&
            isCapped   == true  &&
            isSnapshot == true  &&
            isPausable == true)
            return true;
        return false;
    }

    function isForth
    (
        bool isBurnable,
        bool isCapped,
        bool isSnapshot,
        bool isPausable
    )
    private
    pure
    returns (bool)
    {
        if (isBurnable == true  &&
            isCapped   == true  &&
            isSnapshot == true  &&
            isPausable == true)
            return true;
        return false;
    }
}

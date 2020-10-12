// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "openzeppelin-solidity/contracts/access/Ownable.sol";

import "./TokenFactorySingleBC.sol";
import "./TokenFactorySingleOther.sol";
import "./TokenFactoryDoubleB.sol";
import "./TokenFactoryDoubleOther.sol";
import "./TokenFactoryTriple1.sol";
import "./TokenFactoryTriple2.sol";
import "./TokenFactoryForth.sol";
import "./MedianOracle.sol";

contract TokenFactoryMain is Ownable
{
    using SafeMath for uint256;

    TokenFactorySingleBC    public TokenFactorySingleBCAddr;
    TokenFactorySingleOther public TokenFactorySingleOtherAddr;
    TokenFactoryDoubleB     public TokenFactoryDoubleBAddr;
    TokenFactoryDoubleOther public TokenFactoryDoubleOtherAddr;
    TokenFactoryTriple1     public TokenFactoryTriple1Addr;
    TokenFactoryTriple2     public TokenFactoryTriple2Addr;
    TokenFactoryForth       public TokenFactoryForthAddr;
    IOracle                 public MedianOracleAddr;
    address payable         public feeWallet;
    uint256                 public usdCost;

    constructor
    (
        TokenFactorySingleBC    _TokenFactorySingleBCAddr,
        TokenFactorySingleOther _TokenFactorySingleOtherAddr,
        TokenFactoryDoubleB     _TokenFactoryDoubleBAddr,
        TokenFactoryDoubleOther _TokenFactoryDoubleOtherAddr,
        TokenFactoryTriple1     _TokenFactoryTriple1Addr,
        TokenFactoryTriple2     _TokenFactoryTriple2Addr,
        TokenFactoryForth       _TokenFactoryForthAddr,
        IOracle                 _MedianOracleAddr,
        address payable         _feeWallet,
        uint256                 _usdCost
    )
    public
    {
        TokenFactorySingleBCAddr    = _TokenFactorySingleBCAddr;
        TokenFactorySingleOtherAddr = _TokenFactorySingleOtherAddr;
        TokenFactoryDoubleBAddr     = _TokenFactoryDoubleBAddr;
        TokenFactoryDoubleOtherAddr = _TokenFactoryDoubleOtherAddr;
        TokenFactoryTriple1Addr     = _TokenFactoryTriple1Addr;
        TokenFactoryTriple2Addr     = _TokenFactoryTriple2Addr;
        TokenFactoryForthAddr       = _TokenFactoryForthAddr;
        MedianOracleAddr            = _MedianOracleAddr;
        feeWallet                   = _feeWallet;
        usdCost                     = _usdCost;
    }

    event createdToken(address newToken);

    function changeUsdPrice(uint256 _usdCost) public onlyOwner
    {
        usdCost = _usdCost;
    }

    function changeOracle(IOracle _MedianOracleAddr) public onlyOwner
    {
        MedianOracleAddr = _MedianOracleAddr;
    }

    function changeFeeWallet(address payable _feeWallet) public onlyOwner
    {
        feeWallet = _feeWallet;
    }

    function createToken
    (
        string memory name,
        string memory symbol,
        uint8 decimals,
        bool isBurnable,
        bool isCapped,
        uint256 cap,
        bool isPausable,
        bool isSnapshot,
        address tokenOwner
    )
    public
    payable
    returns (address newToken)
    {
        checkAndTransferFee();
        newToken = address(0);
        if (isSingleBC(isBurnable, isCapped, isSnapshot, isPausable) == true)
            newToken = address(TokenFactorySingleBCAddr.createToken(name,
                                                                       symbol,
                                                                       decimals,
                                                                       isBurnable,
                                                                       isCapped,
                                                                       cap,
                                                                       tokenOwner));
        else if (isSingleOther(isBurnable, isCapped, isSnapshot, isPausable) == true)
            newToken = address(TokenFactorySingleOtherAddr.createToken(name,
                                                                         symbol,
                                                                         decimals,
                                                                         isSnapshot,
                                                                         isPausable,
                                                                         tokenOwner));
        else if (isDoubleB(isBurnable, isCapped, isSnapshot, isPausable) == true)
            newToken = address(TokenFactoryDoubleBAddr.createToken(name,
                                                                     symbol,
                                                                     decimals,
                                                                     isBurnable,
                                                                     isCapped,
                                                                     cap,
                                                                     isSnapshot,
                                                                     isPausable,
                                                                     tokenOwner));
        else if (isDoubleOther(isBurnable, isCapped, isSnapshot, isPausable) == true)
            newToken = address(TokenFactoryDoubleOtherAddr.createToken(name,
                                                                         symbol,
                                                                         decimals,
                                                                         isCapped,
                                                                         cap,
                                                                         isSnapshot,
                                                                         isPausable,
                                                                         tokenOwner));
        else if (isTriple1(isBurnable, isCapped, isSnapshot, isPausable) == true)
            newToken = address(TokenFactoryTriple1Addr.createToken(name,
                                                                     symbol,
                                                                     decimals,
                                                                     isBurnable,
                                                                     isCapped,
                                                                     cap,
                                                                     isSnapshot,
                                                                     isPausable,
                                                                     tokenOwner));
        else if (isTriple2(isBurnable, isCapped, isSnapshot, isPausable) == true)
            newToken = address(TokenFactoryTriple2Addr.createToken(name,
                                                                     symbol,
                                                                     decimals,
                                                                     isBurnable,
                                                                     isCapped,
                                                                     cap,
                                                                     isSnapshot,
                                                                     isPausable,
                                                                     tokenOwner));
        else if (isForth(isBurnable, isCapped, isSnapshot, isPausable) == true)
            newToken = address(TokenFactoryForthAddr.createToken(name,
                                                                  symbol,
                                                                  decimals,
                                                                  cap,
                                                                  tokenOwner));
        require(newToken != address(0));
        emit createdToken(newToken);
        return newToken;
    }

    function checkAndTransferFee() private
    {
        uint256 value = msg.value;
        (uint256 rate, bool validation) = MedianOracleAddr.getData();
        require(validation == true, "TokenFactoryMain: Couldn't get rate eth/usd from oracle.");
        require(value * rate >= usdCost, "TokenFactoryMain: Not enough value.");
        // return USD_COST.mul(TOKEN_AMOUNT).mul(PRICE_PERC).div(ETH_USD_RATE).div(PRICE_DECIMALS);
        uint256 feeWei = usdCost.mul(10 ** 18).div(rate);
        feeWallet.transfer(feeWei);
        uint256 change = msg.value.sub(feeWei);
        if (change > 0)
            _msgSender().transfer(change);
    }

    function isSingleBC
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
            isSnapshot == false &&
            isPausable == false)
            return true;
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

    function isSingleOther
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
        if (isBurnable == false &&
            isCapped   == false &&
            isSnapshot == false &&
            isPausable == false)
            return true;
        return false;
    }

    function isDoubleB
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

    function isDoubleOther
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

    function isTriple1
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

    function isTriple2
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

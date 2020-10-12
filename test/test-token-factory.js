const BN = require("bn.js");
const chai = require("chai");
const { expect, assert } = require("chai");
const expectRevert = require("./utils/expectRevert.js");
chai.use(require("chai-bn")(BN));


const TokenFactoryMain = artifacts.require('TokenFactoryMain');
const TokenFactorySingleBC = artifacts.require('TokenFactorySingleBC');
const TokenFactorySingleOther = artifacts.require('TokenFactorySingleOther');
const TokenFactoryDoubleB = artifacts.require('TokenFactoryDoubleB');
const TokenFactoryDoubleOther = artifacts.require('TokenFactoryDoubleOther');
const TokenFactoryTriple1 = artifacts.require('TokenFactoryTriple1');
const TokenFactoryTriple2 = artifacts.require('TokenFactoryTriple2');
const TokenFactoryForth = artifacts.require('TokenFactoryForth');

const MedianOracle =  artifacts.require('MedianOracle');
const REPORT_EXPIRATION_TIME_SEC = new BN(60 * 60 * 24 * 2);
const REPORT_DELAY_SEC = new BN(2);
const MINIMUM_PROVIDERS = new BN(1);
const USD_COST = new BN((40 * 10 ** 18).toString());
const ETH_USD_RATE = new BN((36693 * 10 ** 16).toString());
const PRICE_PERC_LOW = new BN(95);
const PRICE_PERC_EQ = new BN(100);
const PRICE_DECIMALS = new BN(100);

const Token0 = artifacts.require('token0');
const TokenB = artifacts.require('tokenB');
const TokenBC = artifacts.require('tokenBC');
const TokenBCP = artifacts.require('tokenBCP');
const TokenBCS = artifacts.require('tokenBCS');
const TokenBCSP = artifacts.require('tokenBCSP');
const TokenBP = artifacts.require('tokenBP');
const TokenBPS = artifacts.require('tokenBPS');
const TokenBS = artifacts.require('tokenBS');
const TokenC = artifacts.require('tokenC');
const TokenCP = artifacts.require('tokenCP');
const TokenCPS = artifacts.require('tokenCPS');
const TokenCS = artifacts.require('tokenCS');
const TokenP = artifacts.require('tokenP');
const TokenPS = artifacts.require('tokenPS');
const TokenS = artifacts.require('tokenS');

const TOKEN_AMOUNT = new BN((10 ** 18).toString());
const ETH_ZERO_ADDERSS = '0x0000000000000000000000000000000000000000';

contract(
    'Token-factory-test',
    ([
        factoryOwner,
        oracleOwner,
        customer,
        customerMint,
        customerBurn,
        customerCap,
        customerPasuable,
        customerSnapshot,
        feeWallet
    ]) => {
        let SingleBC;
        let SingleOther;
        let DoubleB;
        let DoubleOther;
        let Triple1;
        let Triple2;
        let Forth;
        let Factory;
        let Oracle;


        beforeEach(async () => {
            // Init contracts

            SingleBC = await TokenFactorySingleBC.new(
                {from: factoryOwner}
            );
            SingleOther = await TokenFactorySingleOther.new(
                {from: factoryOwner}
            );
            DoubleB = await TokenFactoryDoubleB.new(
                {from: factoryOwner}
            );
            DoubleOther = await TokenFactoryDoubleOther.new(
                {from: factoryOwner}
            );
            Triple1 = await TokenFactoryTriple1.new(
                {from: factoryOwner}
            );
            Triple2 = await TokenFactoryTriple2.new(
                {from: factoryOwner}
            );
            Forth = await TokenFactoryForth.new(
                {from: factoryOwner}
            );

            Oracle = await MedianOracle.new(
                REPORT_EXPIRATION_TIME_SEC,
                REPORT_DELAY_SEC,
                MINIMUM_PROVIDERS,
                {from: oracleOwner}
            );
            //console.log(Oracle.address);
            await Oracle.addProvider(oracleOwner, {from: oracleOwner});
            await Oracle.pushReport(ETH_USD_RATE, {from: oracleOwner});
            await sleep(REPORT_DELAY_SEC.mul(new BN(1000)));

            Factory = await TokenFactoryMain.new(
                SingleBC.address,
                SingleOther.address,
                DoubleB.address,
                DoubleOther.address,
                Triple1.address,
                Triple2.address,
                Forth.address,
                Oracle.address,
                feeWallet,
                USD_COST,
                {from: factoryOwner}
            );

            await SingleBC.setTokenFactoryMain(Factory.address, {from: factoryOwner});
            await SingleOther.setTokenFactoryMain(Factory.address, {from: factoryOwner});
            await DoubleB.setTokenFactoryMain(Factory.address, {from: factoryOwner});
            await DoubleOther.setTokenFactoryMain(Factory.address, {from: factoryOwner});
            await Triple1.setTokenFactoryMain(Factory.address, {from: factoryOwner});
            await Triple2.setTokenFactoryMain(Factory.address, {from: factoryOwner});
            await Forth.setTokenFactoryMain(Factory.address, {from: factoryOwner});

        })

        it("#0 Deploy validation", async () => {
            expect(await SingleBC.TokenFactoryMain()).to.be.equals(Factory.address);
            expect(await SingleOther.TokenFactoryMain()).to.be.equals(Factory.address);
            expect(await DoubleB.TokenFactoryMain()).to.be.equals(Factory.address);
            expect(await DoubleOther.TokenFactoryMain()).to.be.equals(Factory.address);
            expect(await Triple1.TokenFactoryMain()).to.be.equals(Factory.address);
            expect(await Triple2.TokenFactoryMain()).to.be.equals(Factory.address);
            expect(await Forth.TokenFactoryMain()).to.be.equals(Factory.address);

            expect(await Factory.TokenFactorySingleBCAddr()).to.be.equals(SingleBC.address);
            expect(await Factory.TokenFactorySingleOtherAddr()).to.be.equals(SingleOther.address);
            expect(await Factory.TokenFactoryDoubleBAddr()).to.be.equals(DoubleB.address);
            expect(await Factory.TokenFactoryDoubleOtherAddr()).to.be.equals(DoubleOther.address);
            expect(await Factory.TokenFactoryTriple1Addr()).to.be.equals(Triple1.address);
            expect(await Factory.TokenFactoryTriple2Addr()).to.be.equals(Triple2.address);
            expect(await Factory.TokenFactoryForthAddr()).to.be.equals(Forth.address);
            expect(await Factory.MedianOracleAddr()).to.be.equals(Oracle.address);
            expect(await Factory.feeWallet()).to.be.equals(feeWallet);
            expect(await Factory.usdCost()).to.be.bignumber.that.equals(USD_COST);

            console.log("Cost: " + calculateValue() + " wei.");
        })

        let name = "Test";
        let symbol = "TEST";
        let decimals = new BN("18");
        let cap = TOKEN_AMOUNT.mul(new BN("1000"));
        let tokenContract;

        it("#1 Make token0", async () => {
            // make Token contract for customer
            let feeWalletBalanceBefore = new BN(await web3.eth.getBalance(feeWallet));
            let isBurnable = false;
            let isCapped = false;
            let isPausable = false;
            let isSnapshot = false;
            await expectRevert(
                Factory.createToken(name,
                    symbol,
                    decimals,
                    isBurnable,
                    isCapped,
                    cap,
                    isPausable,
                    isSnapshot,
                    customer,
                    {from: factoryOwner,
                     value: calculateValue().mul(PRICE_PERC_LOW).div(PRICE_DECIMALS)}
                ), "revert");
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       isBurnable,
                                                       isCapped,
                                                       cap,
                                                       isPausable,
                                                       isSnapshot,
                                                       customer,
                                                       {from: factoryOwner,
                                                        value: calculateValue().mul(PRICE_PERC_EQ).div(PRICE_DECIMALS)}
                                                      )
                                ).logs[0].address;
            tokenContract = await Token0.at(tokenContract);
            expect(await tokenContract.owner()).to.be.equals(customer);
            expect(await tokenContract.name()).to.be.equals(name);
            expect(await tokenContract.symbol()).to.be.equals(symbol);
            expect(await tokenContract.decimals()).to.be.bignumber.that.equals(decimals);

            let feeWalletBalanceAfter = new BN(await web3.eth.getBalance(feeWallet));
            expect(feeWalletBalanceAfter.sub(feeWalletBalanceBefore)).to.be.bignumber.that.equals(calculateValue());
        })

        it("#2 Make tokenB", async () => {
            // make Token contract for customer
            let feeWalletBalanceBefore = new BN(await web3.eth.getBalance(feeWallet));
            let isBurnable = true;
            let isCapped = false;
            let isPausable = false;
            let isSnapshot = false;
            await expectRevert(
                Factory.createToken(name,
                    symbol,
                    decimals,
                    isBurnable,
                    isCapped,
                    cap,
                    isPausable,
                    isSnapshot,
                    customer,
                    {from: factoryOwner,
                     value: calculateValue().mul(PRICE_PERC_LOW).div(PRICE_DECIMALS)}
                ), "revert");
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       isBurnable,
                                                       isCapped,
                                                       cap,
                                                       isPausable,
                                                       isSnapshot,
                                                       customer,
                                                       {from: factoryOwner,
                                                        value: calculateValue().mul(PRICE_PERC_EQ).div(PRICE_DECIMALS)}
                                                      )
                                ).logs[0].address;
            tokenContract = await TokenB.at(tokenContract);
            expect(await tokenContract.owner()).to.be.equals(customer);
            expect(await tokenContract.name()).to.be.equals(name);
            expect(await tokenContract.symbol()).to.be.equals(symbol);
            expect(await tokenContract.decimals()).to.be.bignumber.that.equals(decimals);

            await tokenContract.mint(customerMint, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerMint)).to.be.bignumber.that.equals(TOKEN_AMOUNT);

            await tokenContract.mint(customerBurn, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerBurn)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            await tokenContract.burn(TOKEN_AMOUNT, {from: customerBurn});
            expect(await tokenContract.balanceOf(customerBurn)).to.be.bignumber.that.equals(new BN("0"));

            let feeWalletBalanceAfter = new BN(await web3.eth.getBalance(feeWallet));
            expect(feeWalletBalanceAfter.sub(feeWalletBalanceBefore)).to.be.bignumber.that.equals(calculateValue());
        })

        it("#3 Make tokenC", async () => {
            // make Token contract for customer
            let feeWalletBalanceBefore = new BN(await web3.eth.getBalance(feeWallet));
            let isBurnable = false;
            let isCapped = true;
            let isPausable = false;
            let isSnapshot = false;
            await expectRevert(
                Factory.createToken(name,
                    symbol,
                    decimals,
                    isBurnable,
                    isCapped,
                    cap,
                    isPausable,
                    isSnapshot,
                    customer,
                    {from: factoryOwner,
                     value: calculateValue().mul(PRICE_PERC_LOW).div(PRICE_DECIMALS)}
                ), "revert");
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       isBurnable,
                                                       isCapped,
                                                       cap,
                                                       isPausable,
                                                       isSnapshot,
                                                       customer,
                                                       {from: factoryOwner,
                                                        value: calculateValue().mul(PRICE_PERC_EQ).div(PRICE_DECIMALS)}
                                                      )
                                ).logs[0].address;
            tokenContract = await TokenC.at(tokenContract);
            expect(await tokenContract.owner()).to.be.equals(customer);
            expect(await tokenContract.name()).to.be.equals(name);
            expect(await tokenContract.symbol()).to.be.equals(symbol);
            expect(await tokenContract.decimals()).to.be.bignumber.that.equals(decimals);
            expect(await tokenContract.cap()).to.be.bignumber.that.equals(cap);

            await tokenContract.mint(customerMint, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerMint)).to.be.bignumber.that.equals(TOKEN_AMOUNT);

            let capMintAmount = cap.sub(TOKEN_AMOUNT.mul(new BN("1")));
            await tokenContract.mint(customerCap, capMintAmount, {from: customer});
            expect(await tokenContract.balanceOf(customerCap)).to.be.bignumber.that.equals(capMintAmount);
            await expectRevert(tokenContract.mint(customerCap, cap, {from: customer}), "ERC20Capped: cap exceeded");

            let feeWalletBalanceAfter = new BN(await web3.eth.getBalance(feeWallet));
            expect(feeWalletBalanceAfter.sub(feeWalletBalanceBefore)).to.be.bignumber.that.equals(calculateValue());
        })

        it("#4 Make tokenP", async () => {
            // make Token contract for customer
            let feeWalletBalanceBefore = new BN(await web3.eth.getBalance(feeWallet));
            let isBurnable = false;
            let isCapped = false;
            let isPausable = true;
            let isSnapshot = false;
            await expectRevert(
                Factory.createToken(name,
                    symbol,
                    decimals,
                    isBurnable,
                    isCapped,
                    cap,
                    isPausable,
                    isSnapshot,
                    customer,
                    {from: factoryOwner,
                     value: calculateValue().mul(PRICE_PERC_LOW).div(PRICE_DECIMALS)}
                ), "revert");
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       isBurnable,
                                                       isCapped,
                                                       cap,
                                                       isPausable,
                                                       isSnapshot,
                                                       customer,
                                                       {from: factoryOwner,
                                                        value: calculateValue().mul(PRICE_PERC_EQ).div(PRICE_DECIMALS)}
                                                      )
                                ).logs[0].address;
            tokenContract = await TokenP.at(tokenContract);
            expect(await tokenContract.owner()).to.be.equals(customer);
            expect(await tokenContract.name()).to.be.equals(name);
            expect(await tokenContract.symbol()).to.be.equals(symbol);
            expect(await tokenContract.decimals()).to.be.bignumber.that.equals(decimals);
            expect(await tokenContract.paused()).to.be.equals(false);

            await tokenContract.mint(customerMint, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerMint)).to.be.bignumber.that.equals(TOKEN_AMOUNT);

            await expectRevert(tokenContract.pause({from: customerPasuable}), "Ownable: caller is not the owner");
            await tokenContract.pause({from: customer});
            expect(await tokenContract.paused()).to.be.equals(true);
            await expectRevert(tokenContract.transfer(customerPasuable, TOKEN_AMOUNT, {from: customerPasuable}),
                               "ERC20Pausable: token transfer while paused");
            await tokenContract.unpause({from: customer});
            expect(await tokenContract.paused()).to.be.equals(false);

            let feeWalletBalanceAfter = new BN(await web3.eth.getBalance(feeWallet));
            expect(feeWalletBalanceAfter.sub(feeWalletBalanceBefore)).to.be.bignumber.that.equals(calculateValue());
        })

        it("#5 Make tokenS", async () => {
            // make Token contract for customer
            let feeWalletBalanceBefore = new BN(await web3.eth.getBalance(feeWallet));
            let isBurnable = false;
            let isCapped = false;
            let isPausable = false;
            let isSnapshot = true;
            await expectRevert(
                Factory.createToken(name,
                    symbol,
                    decimals,
                    isBurnable,
                    isCapped,
                    cap,
                    isPausable,
                    isSnapshot,
                    customer,
                    {from: factoryOwner,
                     value: calculateValue().mul(PRICE_PERC_LOW).div(PRICE_DECIMALS)}
                ), "revert");
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       isBurnable,
                                                       isCapped,
                                                       cap,
                                                       isPausable,
                                                       isSnapshot,
                                                       customer,
                                                       {from: factoryOwner,
                                                        value: calculateValue().mul(PRICE_PERC_EQ).div(PRICE_DECIMALS)}
                                                      )
                                ).logs[0].address;
            tokenContract = await TokenS.at(tokenContract);
            expect(await tokenContract.owner()).to.be.equals(customer);
            expect(await tokenContract.name()).to.be.equals(name);
            expect(await tokenContract.symbol()).to.be.equals(symbol);
            expect(await tokenContract.decimals()).to.be.bignumber.that.equals(decimals);

            await tokenContract.mint(customerMint, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerMint)).to.be.bignumber.that.equals(TOKEN_AMOUNT);

            await tokenContract.mint(customerSnapshot, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerSnapshot)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            let ind = (await tokenContract.snapshot({from: customer})).logs[0].args.id;
            expect(await tokenContract.balanceOfAt(customerSnapshot, ind)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            expect(await tokenContract.totalSupplyAt(ind)).to.be.bignumber.that.equals(TOKEN_AMOUNT.mul(new BN("2")));

            let feeWalletBalanceAfter = new BN(await web3.eth.getBalance(feeWallet));
            expect(feeWalletBalanceAfter.sub(feeWalletBalanceBefore)).to.be.bignumber.that.equals(calculateValue());
        })

        it("#6 Make tokenBC", async () => {
            // make Token contract for customer
            let feeWalletBalanceBefore = new BN(await web3.eth.getBalance(feeWallet));
            let isBurnable = true;
            let isCapped = true;
            let isPausable = false;
            let isSnapshot = false;
            await expectRevert(
                Factory.createToken(name,
                    symbol,
                    decimals,
                    isBurnable,
                    isCapped,
                    cap,
                    isPausable,
                    isSnapshot,
                    customer,
                    {from: factoryOwner,
                     value: calculateValue().mul(PRICE_PERC_LOW).div(PRICE_DECIMALS)}
                ), "revert");
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       isBurnable,
                                                       isCapped,
                                                       cap,
                                                       isPausable,
                                                       isSnapshot,
                                                       customer,
                                                       {from: factoryOwner,
                                                        value: calculateValue().mul(PRICE_PERC_EQ).div(PRICE_DECIMALS)}
                                                      )
                                ).logs[0].address;
            tokenContract = await TokenBC.at(tokenContract);
            expect(await tokenContract.owner()).to.be.equals(customer);
            expect(await tokenContract.name()).to.be.equals(name);
            expect(await tokenContract.symbol()).to.be.equals(symbol);
            expect(await tokenContract.decimals()).to.be.bignumber.that.equals(decimals);
            expect(await tokenContract.cap()).to.be.bignumber.that.equals(cap);

            await tokenContract.mint(customerMint, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerMint)).to.be.bignumber.that.equals(TOKEN_AMOUNT);

            await tokenContract.mint(customerBurn, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerBurn)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            await tokenContract.burn(TOKEN_AMOUNT, {from: customerBurn});
            expect(await tokenContract.balanceOf(customerBurn)).to.be.bignumber.that.equals(new BN("0"));

            let capMintAmount = cap.sub(TOKEN_AMOUNT.mul(new BN("1")));
            await tokenContract.mint(customerCap, capMintAmount, {from: customer});
            expect(await tokenContract.balanceOf(customerCap)).to.be.bignumber.that.equals(capMintAmount);
            await expectRevert(tokenContract.mint(customerCap, cap, {from: customer}), "ERC20Capped: cap exceeded");

            let feeWalletBalanceAfter = new BN(await web3.eth.getBalance(feeWallet));
            expect(feeWalletBalanceAfter.sub(feeWalletBalanceBefore)).to.be.bignumber.that.equals(calculateValue());
        })

        it("#7 Make tokenBCP", async () => {
            // make Token contract for customer
            let feeWalletBalanceBefore = new BN(await web3.eth.getBalance(feeWallet));
            let isBurnable = true;
            let isCapped = true;
            let isPausable = true;
            let isSnapshot = false;
            await expectRevert(
                Factory.createToken(name,
                    symbol,
                    decimals,
                    isBurnable,
                    isCapped,
                    cap,
                    isPausable,
                    isSnapshot,
                    customer,
                    {from: factoryOwner,
                     value: calculateValue().mul(PRICE_PERC_LOW).div(PRICE_DECIMALS)}
                ), "revert");
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       isBurnable,
                                                       isCapped,
                                                       cap,
                                                       isPausable,
                                                       isSnapshot,
                                                       customer,
                                                       {from: factoryOwner,
                                                        value: calculateValue().mul(PRICE_PERC_EQ).div(PRICE_DECIMALS)}
                                                      )
                                ).logs[0].address;
            tokenContract = await TokenBCP.at(tokenContract);
            expect(await tokenContract.owner()).to.be.equals(customer);
            expect(await tokenContract.name()).to.be.equals(name);
            expect(await tokenContract.symbol()).to.be.equals(symbol);
            expect(await tokenContract.decimals()).to.be.bignumber.that.equals(decimals);
            expect(await tokenContract.cap()).to.be.bignumber.that.equals(cap);
            expect(await tokenContract.paused()).to.be.equals(false);

            await tokenContract.mint(customerMint, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerMint)).to.be.bignumber.that.equals(TOKEN_AMOUNT);

            await tokenContract.mint(customerBurn, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerBurn)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            await tokenContract.burn(TOKEN_AMOUNT, {from: customerBurn});
            expect(await tokenContract.balanceOf(customerBurn)).to.be.bignumber.that.equals(new BN("0"));

            let capMintAmount = cap.sub(TOKEN_AMOUNT.mul(new BN("1")));
            await tokenContract.mint(customerCap, capMintAmount, {from: customer});
            expect(await tokenContract.balanceOf(customerCap)).to.be.bignumber.that.equals(capMintAmount);
            await expectRevert(tokenContract.mint(customerCap, cap, {from: customer}), "ERC20Capped: cap exceeded");

            await expectRevert(tokenContract.pause({from: customerPasuable}), "Ownable: caller is not the owner");
            await tokenContract.pause({from: customer});
            expect(await tokenContract.paused()).to.be.equals(true);
            await expectRevert(tokenContract.transfer(customerPasuable, TOKEN_AMOUNT, {from: customerPasuable}),
                               "ERC20Pausable: token transfer while paused");
            await tokenContract.unpause({from: customer});
            expect(await tokenContract.paused()).to.be.equals(false);

            let feeWalletBalanceAfter = new BN(await web3.eth.getBalance(feeWallet));
            expect(feeWalletBalanceAfter.sub(feeWalletBalanceBefore)).to.be.bignumber.that.equals(calculateValue());
        })

        it("#8 Make tokenBCS", async () => {
            // make Token contract for customer
            let feeWalletBalanceBefore = new BN(await web3.eth.getBalance(feeWallet));
            let isBurnable = true;
            let isCapped = true;
            let isPausable = false;
            let isSnapshot = true;
            await expectRevert(
                Factory.createToken(name,
                    symbol,
                    decimals,
                    isBurnable,
                    isCapped,
                    cap,
                    isPausable,
                    isSnapshot,
                    customer,
                    {from: factoryOwner,
                     value: calculateValue().mul(PRICE_PERC_LOW).div(PRICE_DECIMALS)}
                ), "revert");
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       isBurnable,
                                                       isCapped,
                                                       cap,
                                                       isPausable,
                                                       isSnapshot,
                                                       customer,
                                                       {from: factoryOwner,
                                                        value: calculateValue().mul(PRICE_PERC_EQ).div(PRICE_DECIMALS)}
                                                      )
                                ).logs[0].address;
            tokenContract = await TokenBCS.at(tokenContract);
            expect(await tokenContract.owner()).to.be.equals(customer);
            expect(await tokenContract.name()).to.be.equals(name);
            expect(await tokenContract.symbol()).to.be.equals(symbol);
            expect(await tokenContract.decimals()).to.be.bignumber.that.equals(decimals);
            expect(await tokenContract.cap()).to.be.bignumber.that.equals(cap);

            await tokenContract.mint(customerMint, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerMint)).to.be.bignumber.that.equals(TOKEN_AMOUNT);

            await tokenContract.mint(customerBurn, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerBurn)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            await tokenContract.burn(TOKEN_AMOUNT, {from: customerBurn});
            expect(await tokenContract.balanceOf(customerBurn)).to.be.bignumber.that.equals(new BN("0"));

            await tokenContract.mint(customerSnapshot, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerSnapshot)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            let ind = (await tokenContract.snapshot({from: customer})).logs[0].args.id;
            expect(await tokenContract.balanceOfAt(customerSnapshot, ind)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            expect(await tokenContract.totalSupplyAt(ind)).to.be.bignumber.that.equals(TOKEN_AMOUNT.mul(new BN("2")));

            let capMintAmount = cap.sub(TOKEN_AMOUNT.mul(new BN("2")));
            await tokenContract.mint(customerCap, capMintAmount, {from: customer});
            expect(await tokenContract.balanceOf(customerCap)).to.be.bignumber.that.equals(capMintAmount);
            await expectRevert(tokenContract.mint(customerCap, cap, {from: customer}), "ERC20Capped: cap exceeded");

            let feeWalletBalanceAfter = new BN(await web3.eth.getBalance(feeWallet));
            expect(feeWalletBalanceAfter.sub(feeWalletBalanceBefore)).to.be.bignumber.that.equals(calculateValue());
        })

        it("#9 Make tokenBCSP", async () => {
            // make Token contract for customer
            let feeWalletBalanceBefore = new BN(await web3.eth.getBalance(feeWallet));
            let isBurnable = true;
            let isCapped = true;
            let isPausable = true;
            let isSnapshot = true;
            await expectRevert(
                Factory.createToken(name,
                    symbol,
                    decimals,
                    isBurnable,
                    isCapped,
                    cap,
                    isPausable,
                    isSnapshot,
                    customer,
                    {from: factoryOwner,
                     value: calculateValue().mul(PRICE_PERC_LOW).div(PRICE_DECIMALS)}
                ), "revert");
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       isBurnable,
                                                       isCapped,
                                                       cap,
                                                       isPausable,
                                                       isSnapshot,
                                                       customer,
                                                       {from: factoryOwner,
                                                        value: calculateValue().mul(PRICE_PERC_EQ).div(PRICE_DECIMALS)}
                                                      )
                                ).logs[0].address;
            tokenContract = await TokenBCSP.at(tokenContract);
            expect(await tokenContract.owner()).to.be.equals(customer);
            expect(await tokenContract.name()).to.be.equals(name);
            expect(await tokenContract.symbol()).to.be.equals(symbol);
            expect(await tokenContract.decimals()).to.be.bignumber.that.equals(decimals);
            expect(await tokenContract.cap()).to.be.bignumber.that.equals(cap);
            expect(await tokenContract.paused()).to.be.equals(false);

            await tokenContract.mint(customerMint, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerMint)).to.be.bignumber.that.equals(TOKEN_AMOUNT);

            await tokenContract.mint(customerBurn, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerBurn)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            await tokenContract.burn(TOKEN_AMOUNT, {from: customerBurn});
            expect(await tokenContract.balanceOf(customerBurn)).to.be.bignumber.that.equals(new BN("0"));

            await tokenContract.mint(customerSnapshot, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerSnapshot)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            let ind = (await tokenContract.snapshot({from: customer})).logs[0].args.id;
            expect(await tokenContract.balanceOfAt(customerSnapshot, ind)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            expect(await tokenContract.totalSupplyAt(ind)).to.be.bignumber.that.equals(TOKEN_AMOUNT.mul(new BN("2")));

            let capMintAmount = cap.sub(TOKEN_AMOUNT.mul(new BN("2")));
            await tokenContract.mint(customerCap, capMintAmount, {from: customer});
            expect(await tokenContract.balanceOf(customerCap)).to.be.bignumber.that.equals(capMintAmount);
            await expectRevert(tokenContract.mint(customerCap, cap, {from: customer}), "ERC20Capped: cap exceeded");

            await expectRevert(tokenContract.pause({from: customerPasuable}), "Ownable: caller is not the owner");
            await tokenContract.pause({from: customer});
            expect(await tokenContract.paused()).to.be.equals(true);
            await expectRevert(tokenContract.transfer(customerPasuable, TOKEN_AMOUNT, {from: customerPasuable}),
                               "ERC20Pausable: token transfer while paused");
            await tokenContract.unpause({from: customer});
            expect(await tokenContract.paused()).to.be.equals(false);

            let feeWalletBalanceAfter = new BN(await web3.eth.getBalance(feeWallet));
            expect(feeWalletBalanceAfter.sub(feeWalletBalanceBefore)).to.be.bignumber.that.equals(calculateValue());
        })

        it("#10 Make tokenBP", async () => {
            // make Token contract for customer
            let feeWalletBalanceBefore = new BN(await web3.eth.getBalance(feeWallet));
            let isBurnable = true;
            let isCapped = false;
            let isPausable = true;
            let isSnapshot = false;
            await expectRevert(
                Factory.createToken(name,
                    symbol,
                    decimals,
                    isBurnable,
                    isCapped,
                    cap,
                    isPausable,
                    isSnapshot,
                    customer,
                    {from: factoryOwner,
                     value: calculateValue().mul(PRICE_PERC_LOW).div(PRICE_DECIMALS)}
                ), "revert");
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       isBurnable,
                                                       isCapped,
                                                       cap,
                                                       isPausable,
                                                       isSnapshot,
                                                       customer,
                                                       {from: factoryOwner,
                                                        value: calculateValue().mul(PRICE_PERC_EQ).div(PRICE_DECIMALS)}
                                                      )
                                ).logs[0].address;
            tokenContract = await TokenBP.at(tokenContract);
            expect(await tokenContract.owner()).to.be.equals(customer);
            expect(await tokenContract.name()).to.be.equals(name);
            expect(await tokenContract.symbol()).to.be.equals(symbol);
            expect(await tokenContract.decimals()).to.be.bignumber.that.equals(decimals);
            expect(await tokenContract.paused()).to.be.equals(false);

            await tokenContract.mint(customerMint, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerMint)).to.be.bignumber.that.equals(TOKEN_AMOUNT);

            await tokenContract.mint(customerBurn, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerBurn)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            await tokenContract.burn(TOKEN_AMOUNT, {from: customerBurn});
            expect(await tokenContract.balanceOf(customerBurn)).to.be.bignumber.that.equals(new BN("0"));

            await expectRevert(tokenContract.pause({from: customerPasuable}), "Ownable: caller is not the owner");
            await tokenContract.pause({from: customer});
            expect(await tokenContract.paused()).to.be.equals(true);
            await expectRevert(tokenContract.transfer(customerPasuable, TOKEN_AMOUNT, {from: customerPasuable}),
                               "ERC20Pausable: token transfer while paused");
            await tokenContract.unpause({from: customer});
            expect(await tokenContract.paused()).to.be.equals(false);

            let feeWalletBalanceAfter = new BN(await web3.eth.getBalance(feeWallet));
            expect(feeWalletBalanceAfter.sub(feeWalletBalanceBefore)).to.be.bignumber.that.equals(calculateValue());
        })

        it("#11 Make tokenBPS", async () => {
            // make Token contract for customer
            let feeWalletBalanceBefore = new BN(await web3.eth.getBalance(feeWallet));
            let isBurnable = true;
            let isCapped = false;
            let isPausable = true;
            let isSnapshot = true;
            await expectRevert(
                Factory.createToken(name,
                    symbol,
                    decimals,
                    isBurnable,
                    isCapped,
                    cap,
                    isPausable,
                    isSnapshot,
                    customer,
                    {from: factoryOwner,
                     value: calculateValue().mul(PRICE_PERC_LOW).div(PRICE_DECIMALS)}
                ), "revert");
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       isBurnable,
                                                       isCapped,
                                                       cap,
                                                       isPausable,
                                                       isSnapshot,
                                                       customer,
                                                       {from: factoryOwner,
                                                        value: calculateValue().mul(PRICE_PERC_EQ).div(PRICE_DECIMALS)}
                                                      )
                                ).logs[0].address;
            tokenContract = await TokenBPS.at(tokenContract);
            expect(await tokenContract.owner()).to.be.equals(customer);
            expect(await tokenContract.name()).to.be.equals(name);
            expect(await tokenContract.symbol()).to.be.equals(symbol);
            expect(await tokenContract.decimals()).to.be.bignumber.that.equals(decimals);
            expect(await tokenContract.paused()).to.be.equals(false);

            await tokenContract.mint(customerMint, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerMint)).to.be.bignumber.that.equals(TOKEN_AMOUNT);

            await tokenContract.mint(customerBurn, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerBurn)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            await tokenContract.burn(TOKEN_AMOUNT, {from: customerBurn});
            expect(await tokenContract.balanceOf(customerBurn)).to.be.bignumber.that.equals(new BN("0"));

            await tokenContract.mint(customerSnapshot, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerSnapshot)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            let ind = (await tokenContract.snapshot({from: customer})).logs[0].args.id;
            expect(await tokenContract.balanceOfAt(customerSnapshot, ind)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            expect(await tokenContract.totalSupplyAt(ind)).to.be.bignumber.that.equals(TOKEN_AMOUNT.mul(new BN("2")));

            await expectRevert(tokenContract.pause({from: customerPasuable}), "Ownable: caller is not the owner");
            await tokenContract.pause({from: customer});
            expect(await tokenContract.paused()).to.be.equals(true);
            await expectRevert(tokenContract.transfer(customerPasuable, TOKEN_AMOUNT, {from: customerPasuable}),
                               "ERC20Pausable: token transfer while paused");
            await tokenContract.unpause({from: customer});
            expect(await tokenContract.paused()).to.be.equals(false);

            let feeWalletBalanceAfter = new BN(await web3.eth.getBalance(feeWallet));
            expect(feeWalletBalanceAfter.sub(feeWalletBalanceBefore)).to.be.bignumber.that.equals(calculateValue());
        })

        it("#12 Make tokenBS", async () => {
            // make Token contract for customer
            let feeWalletBalanceBefore = new BN(await web3.eth.getBalance(feeWallet));
            let isBurnable = true;
            let isCapped = false;
            let isPausable = false;
            let isSnapshot = true;
            await expectRevert(
                Factory.createToken(name,
                    symbol,
                    decimals,
                    isBurnable,
                    isCapped,
                    cap,
                    isPausable,
                    isSnapshot,
                    customer,
                    {from: factoryOwner,
                     value: calculateValue().mul(PRICE_PERC_LOW).div(PRICE_DECIMALS)}
                ), "revert");
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       isBurnable,
                                                       isCapped,
                                                       cap,
                                                       isPausable,
                                                       isSnapshot,
                                                       customer,
                                                       {from: factoryOwner,
                                                        value: calculateValue().mul(PRICE_PERC_EQ).div(PRICE_DECIMALS)}
                                                      )
                                ).logs[0].address;
            tokenContract = await TokenBS.at(tokenContract);
            expect(await tokenContract.owner()).to.be.equals(customer);
            expect(await tokenContract.name()).to.be.equals(name);
            expect(await tokenContract.symbol()).to.be.equals(symbol);
            expect(await tokenContract.decimals()).to.be.bignumber.that.equals(decimals);

            await tokenContract.mint(customerMint, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerMint)).to.be.bignumber.that.equals(TOKEN_AMOUNT);

            await tokenContract.mint(customerBurn, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerBurn)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            await tokenContract.burn(TOKEN_AMOUNT, {from: customerBurn});
            expect(await tokenContract.balanceOf(customerBurn)).to.be.bignumber.that.equals(new BN("0"));

            await tokenContract.mint(customerSnapshot, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerSnapshot)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            let ind = (await tokenContract.snapshot({from: customer})).logs[0].args.id;
            expect(await tokenContract.balanceOfAt(customerSnapshot, ind)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            expect(await tokenContract.totalSupplyAt(ind)).to.be.bignumber.that.equals(TOKEN_AMOUNT.mul(new BN("2")));

            let feeWalletBalanceAfter = new BN(await web3.eth.getBalance(feeWallet));
            expect(feeWalletBalanceAfter.sub(feeWalletBalanceBefore)).to.be.bignumber.that.equals(calculateValue());
        })

        it("#13 Make tokenCP", async () => {
            // make Token contract for customer
            let feeWalletBalanceBefore = new BN(await web3.eth.getBalance(feeWallet));
            let isBurnable = false;
            let isCapped = true;
            let isPausable = true;
            let isSnapshot = false;
            await expectRevert(
                Factory.createToken(name,
                    symbol,
                    decimals,
                    isBurnable,
                    isCapped,
                    cap,
                    isPausable,
                    isSnapshot,
                    customer,
                    {from: factoryOwner,
                     value: calculateValue().mul(PRICE_PERC_LOW).div(PRICE_DECIMALS)}
                ), "revert");
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       isBurnable,
                                                       isCapped,
                                                       cap,
                                                       isPausable,
                                                       isSnapshot,
                                                       customer,
                                                       {from: factoryOwner,
                                                        value: calculateValue().mul(PRICE_PERC_EQ).div(PRICE_DECIMALS)}
                                                      )
                                ).logs[0].address;
            tokenContract = await TokenCP.at(tokenContract);
            expect(await tokenContract.owner()).to.be.equals(customer);
            expect(await tokenContract.name()).to.be.equals(name);
            expect(await tokenContract.symbol()).to.be.equals(symbol);
            expect(await tokenContract.decimals()).to.be.bignumber.that.equals(decimals);
            expect(await tokenContract.cap()).to.be.bignumber.that.equals(cap);
            expect(await tokenContract.paused()).to.be.equals(false);

            await tokenContract.mint(customerMint, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerMint)).to.be.bignumber.that.equals(TOKEN_AMOUNT);

            let capMintAmount = cap.sub(TOKEN_AMOUNT.mul(new BN("1")));
            await tokenContract.mint(customerCap, capMintAmount, {from: customer});
            expect(await tokenContract.balanceOf(customerCap)).to.be.bignumber.that.equals(capMintAmount);
            await expectRevert(tokenContract.mint(customerCap, cap, {from: customer}), "ERC20Capped: cap exceeded");

            await expectRevert(tokenContract.pause({from: customerPasuable}), "Ownable: caller is not the owner");
            await tokenContract.pause({from: customer});
            expect(await tokenContract.paused()).to.be.equals(true);
            await expectRevert(tokenContract.transfer(customerPasuable, TOKEN_AMOUNT, {from: customerPasuable}),
                               "ERC20Pausable: token transfer while paused");
            await tokenContract.unpause({from: customer});
            expect(await tokenContract.paused()).to.be.equals(false);

            let feeWalletBalanceAfter = new BN(await web3.eth.getBalance(feeWallet));
            expect(feeWalletBalanceAfter.sub(feeWalletBalanceBefore)).to.be.bignumber.that.equals(calculateValue());
        })

        it("#14 Make tokenCPS", async () => {
            // make Token contract for customer
            let feeWalletBalanceBefore = new BN(await web3.eth.getBalance(feeWallet));
            let isBurnable = false;
            let isCapped = true;
            let isPausable = true;
            let isSnapshot = true;
            await expectRevert(
                Factory.createToken(name,
                    symbol,
                    decimals,
                    isBurnable,
                    isCapped,
                    cap,
                    isPausable,
                    isSnapshot,
                    customer,
                    {from: factoryOwner,
                     value: calculateValue().mul(PRICE_PERC_LOW).div(PRICE_DECIMALS)}
                ), "revert");
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       isBurnable,
                                                       isCapped,
                                                       cap,
                                                       isPausable,
                                                       isSnapshot,
                                                       customer,
                                                       {from: factoryOwner,
                                                        value: calculateValue().mul(PRICE_PERC_EQ).div(PRICE_DECIMALS)}
                                                      )
                                ).logs[0].address;
            tokenContract = await TokenCPS.at(tokenContract);
            expect(await tokenContract.owner()).to.be.equals(customer);
            expect(await tokenContract.name()).to.be.equals(name);
            expect(await tokenContract.symbol()).to.be.equals(symbol);
            expect(await tokenContract.decimals()).to.be.bignumber.that.equals(decimals);
            expect(await tokenContract.cap()).to.be.bignumber.that.equals(cap);
            expect(await tokenContract.paused()).to.be.equals(false);

            await tokenContract.mint(customerMint, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerMint)).to.be.bignumber.that.equals(TOKEN_AMOUNT);

            await tokenContract.mint(customerSnapshot, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerSnapshot)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            let ind = (await tokenContract.snapshot({from: customer})).logs[0].args.id;
            expect(await tokenContract.balanceOfAt(customerSnapshot, ind)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            expect(await tokenContract.totalSupplyAt(ind)).to.be.bignumber.that.equals(TOKEN_AMOUNT.mul(new BN("2")));

            let capMintAmount = cap.sub(TOKEN_AMOUNT.mul(new BN("2")));
            await tokenContract.mint(customerCap, capMintAmount, {from: customer});
            expect(await tokenContract.balanceOf(customerCap)).to.be.bignumber.that.equals(capMintAmount);
            await expectRevert(tokenContract.mint(customerCap, cap, {from: customer}), "ERC20Capped: cap exceeded");

            await expectRevert(tokenContract.pause({from: customerPasuable}), "Ownable: caller is not the owner");
            await tokenContract.pause({from: customer});
            expect(await tokenContract.paused()).to.be.equals(true);
            await expectRevert(tokenContract.transfer(customerPasuable, TOKEN_AMOUNT, {from: customerPasuable}),
                               "ERC20Pausable: token transfer while paused");
            await tokenContract.unpause({from: customer});
            expect(await tokenContract.paused()).to.be.equals(false);

            let feeWalletBalanceAfter = new BN(await web3.eth.getBalance(feeWallet));
            expect(feeWalletBalanceAfter.sub(feeWalletBalanceBefore)).to.be.bignumber.that.equals(calculateValue());
        })

        it("#15 Make tokenCS", async () => {
            // make Token contract for customer
            let feeWalletBalanceBefore = new BN(await web3.eth.getBalance(feeWallet));
            let isBurnable = false;
            let isCapped = true;
            let isPausable = false;
            let isSnapshot = true;
            await expectRevert(
                Factory.createToken(name,
                    symbol,
                    decimals,
                    isBurnable,
                    isCapped,
                    cap,
                    isPausable,
                    isSnapshot,
                    customer,
                    {from: factoryOwner,
                     value: calculateValue().mul(PRICE_PERC_LOW).div(PRICE_DECIMALS)}
                ), "revert");
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       isBurnable,
                                                       isCapped,
                                                       cap,
                                                       isPausable,
                                                       isSnapshot,
                                                       customer,
                                                       {from: factoryOwner,
                                                        value: calculateValue().mul(PRICE_PERC_EQ).div(PRICE_DECIMALS)}
                                                      )
                                ).logs[0].address;
            tokenContract = await TokenCS.at(tokenContract);
            expect(await tokenContract.owner()).to.be.equals(customer);
            expect(await tokenContract.name()).to.be.equals(name);
            expect(await tokenContract.symbol()).to.be.equals(symbol);
            expect(await tokenContract.decimals()).to.be.bignumber.that.equals(decimals);
            expect(await tokenContract.cap()).to.be.bignumber.that.equals(cap);

            await tokenContract.mint(customerMint, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerMint)).to.be.bignumber.that.equals(TOKEN_AMOUNT);

            await tokenContract.mint(customerSnapshot, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerSnapshot)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            let ind = (await tokenContract.snapshot({from: customer})).logs[0].args.id;
            expect(await tokenContract.balanceOfAt(customerSnapshot, ind)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            expect(await tokenContract.totalSupplyAt(ind)).to.be.bignumber.that.equals(TOKEN_AMOUNT.mul(new BN("2")));

            let capMintAmount = cap.sub(TOKEN_AMOUNT.mul(new BN("2")));
            await tokenContract.mint(customerCap, capMintAmount, {from: customer});
            expect(await tokenContract.balanceOf(customerCap)).to.be.bignumber.that.equals(capMintAmount);
            await expectRevert(tokenContract.mint(customerCap, cap, {from: customer}), "ERC20Capped: cap exceeded");

            let feeWalletBalanceAfter = new BN(await web3.eth.getBalance(feeWallet));
            expect(feeWalletBalanceAfter.sub(feeWalletBalanceBefore)).to.be.bignumber.that.equals(calculateValue());
        })

        it("#16 Make tokenPS", async () => {
            // make Token contract for customer
            let feeWalletBalanceBefore = new BN(await web3.eth.getBalance(feeWallet));
            let isBurnable = false;
            let isCapped = false;
            let isPausable = true;
            let isSnapshot = true;
            await expectRevert(
                Factory.createToken(name,
                    symbol,
                    decimals,
                    isBurnable,
                    isCapped,
                    cap,
                    isPausable,
                    isSnapshot,
                    customer,
                    {from: factoryOwner,
                     value: calculateValue().mul(PRICE_PERC_LOW).div(PRICE_DECIMALS)}
                ), "revert");
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       isBurnable,
                                                       isCapped,
                                                       cap,
                                                       isPausable,
                                                       isSnapshot,
                                                       customer,
                                                       {from: factoryOwner,
                                                        value: calculateValue().mul(PRICE_PERC_EQ).div(PRICE_DECIMALS)}
                                                      )
                                ).logs[0].address;
            tokenContract = await TokenPS.at(tokenContract);
            expect(await tokenContract.owner()).to.be.equals(customer);
            expect(await tokenContract.name()).to.be.equals(name);
            expect(await tokenContract.symbol()).to.be.equals(symbol);
            expect(await tokenContract.decimals()).to.be.bignumber.that.equals(decimals);
            expect(await tokenContract.paused()).to.be.equals(false);

            await tokenContract.mint(customerMint, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerMint)).to.be.bignumber.that.equals(TOKEN_AMOUNT);

            await tokenContract.mint(customerSnapshot, TOKEN_AMOUNT, {from: customer});
            expect(await tokenContract.balanceOf(customerSnapshot)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            let ind = (await tokenContract.snapshot({from: customer})).logs[0].args.id;
            expect(await tokenContract.balanceOfAt(customerSnapshot, ind)).to.be.bignumber.that.equals(TOKEN_AMOUNT);
            expect(await tokenContract.totalSupplyAt(ind)).to.be.bignumber.that.equals(TOKEN_AMOUNT.mul(new BN("2")));

            await expectRevert(tokenContract.pause({from: customerPasuable}), "Ownable: caller is not the owner");
            await tokenContract.pause({from: customer});
            expect(await tokenContract.paused()).to.be.equals(true);
            await expectRevert(tokenContract.transfer(customerPasuable, TOKEN_AMOUNT, {from: customerPasuable}),
                               "ERC20Pausable: token transfer while paused");
            await tokenContract.unpause({from: customer});
            expect(await tokenContract.paused()).to.be.equals(false);

            let feeWalletBalanceAfter = new BN(await web3.eth.getBalance(feeWallet));
            expect(feeWalletBalanceAfter.sub(feeWalletBalanceBefore)).to.be.bignumber.that.equals(calculateValue());
        })

        function sleep (time) {
            return new Promise((resolve) => setTimeout(resolve, time));
        }

        function calculateValue()
        {
            return USD_COST.mul(TOKEN_AMOUNT).div(ETH_USD_RATE);
        }
    }
)
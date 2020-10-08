const BN = require("bn.js");
const chai = require("chai");
const { expect, assert } = require("chai");
const expectRevert = require("./utils/expectRevert.js");
chai.use(require("chai-bn")(BN));


const TokenFactoryMain = artifacts.require('TokenFactoryMain');
const TokenFactorySingle_B_C = artifacts.require('TokenFactorySingle_B_C');
const TokenFactorySingle_other = artifacts.require('TokenFactorySingle_other');
const TokenFactoryDouble_B = artifacts.require('TokenFactoryDouble_B');
const TokenFactoryDouble_other = artifacts.require('TokenFactoryDouble_other');
const TokenFactoryTriple_1 = artifacts.require('TokenFactoryTriple_1');
const TokenFactoryTriple_2 = artifacts.require('TokenFactoryTriple_2');
const TokenFactoryForth = artifacts.require('TokenFactoryForth');

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
        customer,
        customerMint,
        customerBurn,
        customerCap,
        customerPasuable,
        customerSnapshot
    ]) => {
        let Single_B_C;
        let Single_other;
        let Double_B;
        let Double_other;
        let Triple_1;
        let Triple_2;
        let Forth;
        let Factory;


        beforeEach(async () => {
            // Init contracts

            Single_B_C = await TokenFactorySingle_B_C.new(
                {from: factoryOwner}
            );
            Single_other = await TokenFactorySingle_other.new(
                {from: factoryOwner}
            );
            Double_B = await TokenFactoryDouble_B.new(
                {from: factoryOwner}
            );
            Double_other = await TokenFactoryDouble_other.new(
                {from: factoryOwner}
            );
            Triple_1 = await TokenFactoryTriple_1.new(
                {from: factoryOwner}
            );
            Triple_2 = await TokenFactoryTriple_2.new(
                {from: factoryOwner}
            );
            Forth = await TokenFactoryForth.new(
                {from: factoryOwner}
            );

            Factory = await TokenFactoryMain.new(
                Single_B_C.address,
                Single_other.address,
                Double_B.address,
                Double_other.address,
                Triple_1.address,
                Triple_2.address,
                Forth.address,
                {from: factoryOwner}
            );

            await Single_B_C.setTokenFactoryMain(Factory.address);
            await Single_other.setTokenFactoryMain(Factory.address);
            await Double_B.setTokenFactoryMain(Factory.address);
            await Double_other.setTokenFactoryMain(Factory.address);
            await Triple_1.setTokenFactoryMain(Factory.address);
            await Triple_2.setTokenFactoryMain(Factory.address);
            await Forth.setTokenFactoryMain(Factory.address);

        })

        it("#0 Deploy validation", async () => {
            expect(await Single_B_C.TokenFactoryMain()).to.be.equals(Factory.address);
            expect(await Single_other.TokenFactoryMain()).to.be.equals(Factory.address);
            expect(await Double_B.TokenFactoryMain()).to.be.equals(Factory.address);
            expect(await Double_other.TokenFactoryMain()).to.be.equals(Factory.address);
            expect(await Triple_1.TokenFactoryMain()).to.be.equals(Factory.address);
            expect(await Triple_2.TokenFactoryMain()).to.be.equals(Factory.address);
            expect(await Forth.TokenFactoryMain()).to.be.equals(Factory.address);

            expect(await Factory.TokenFactorySingle_B_C_addr()).to.be.equals(Single_B_C.address);
            expect(await Factory.TokenFactorySingle_other_addr()).to.be.equals(Single_other.address);
            expect(await Factory.TokenFactoryDouble_B_addr()).to.be.equals(Double_B.address);
            expect(await Factory.TokenFactoryDouble_other_addr()).to.be.equals(Double_other.address);
            expect(await Factory.TokenFactoryTriple_1_addr()).to.be.equals(Triple_1.address);
            expect(await Factory.TokenFactoryTriple_2_addr()).to.be.equals(Triple_2.address);
            expect(await Factory.TokenFactoryForth_addr()).to.be.equals(Forth.address);
        })

        let name = "Test";
        let symbol = "TEST";
        let decimals = new BN("18");
        let cap = TOKEN_AMOUNT.mul(new BN("1000"));
        let tokenContract;

        it("#1 Make token0", async () => {
            // make Token contract for customer
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       false,
                                                       false,
                                                       cap,
                                                       false,
                                                       false,
                                                       customer,
                                                       {from: factoryOwner}
                                                      )
                                ).logs[0].address;
            tokenContract = await Token0.at(tokenContract);
            expect(await tokenContract.owner()).to.be.equals(customer);
            expect(await tokenContract.name()).to.be.equals(name);
            expect(await tokenContract.symbol()).to.be.equals(symbol);
            expect(await tokenContract.decimals()).to.be.bignumber.that.equals(decimals);
        })

        it("#2 Make tokenB", async () => {
            // make Token contract for customer
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       true,
                                                       false,
                                                       cap,
                                                       false,
                                                       false,
                                                       customer,
                                                       {from: factoryOwner}
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
        })

        it("#3 Make tokenC", async () => {
            // make Token contract for customer
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       false,
                                                       true,
                                                       cap,
                                                       false,
                                                       false,
                                                       customer,
                                                       {from: factoryOwner}
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
        })

        it("#4 Make tokenP", async () => {
            // make Token contract for customer
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       false,
                                                       false,
                                                       cap,
                                                       true,
                                                       false,
                                                       customer,
                                                       {from: factoryOwner}
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
        })

        it("#5 Make tokenS", async () => {
            // make Token contract for customer
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       false,
                                                       false,
                                                       cap,
                                                       false,
                                                       true,
                                                       customer,
                                                       {from: factoryOwner}
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
        })

        it("#6 Make tokenBC", async () => {
            // make Token contract for customer
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       true,
                                                       true,
                                                       cap,
                                                       false,
                                                       false,
                                                       customer,
                                                       {from: factoryOwner}
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
        })

        it("#7 Make tokenBCP", async () => {
            // make Token contract for customer
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       true,
                                                       true,
                                                       cap,
                                                       true,
                                                       false,
                                                       customer,
                                                       {from: factoryOwner}
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
        })

        it("#8 Make tokenBCS", async () => {
            // make Token contract for customer
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       true,
                                                       true,
                                                       cap,
                                                       false,
                                                       true,
                                                       customer,
                                                       {from: factoryOwner}
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
        })

        it("#9 Make tokenBCSP", async () => {
            // make Token contract for customer
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       true,
                                                       true,
                                                       cap,
                                                       true,
                                                       true,
                                                       customer,
                                                       {from: factoryOwner}
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
        })

        it("#10 Make tokenBP", async () => {
            // make Token contract for customer
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       true,
                                                       false,
                                                       cap,
                                                       true,
                                                       false,
                                                       customer,
                                                       {from: factoryOwner}
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
        })

        it("#11 Make tokenBPS", async () => {
            // make Token contract for customer
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       true,
                                                       false,
                                                       cap,
                                                       true,
                                                       true,
                                                       customer,
                                                       {from: factoryOwner}
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
        })

        it("#12 Make tokenBS", async () => {
            // make Token contract for customer
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       true,
                                                       false,
                                                       cap,
                                                       false,
                                                       true,
                                                       customer,
                                                       {from: factoryOwner}
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
        })

        it("#13 Make tokenCP", async () => {
            // make Token contract for customer
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       false,
                                                       true,
                                                       cap,
                                                       true,
                                                       false,
                                                       customer,
                                                       {from: factoryOwner}
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
        })

        it("#14 Make tokenCPS", async () => {
            // make Token contract for customer
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       false,
                                                       true,
                                                       cap,
                                                       true,
                                                       true,
                                                       customer,
                                                       {from: factoryOwner}
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
        })

        it("#15 Make tokenCS", async () => {
            // make Token contract for customer
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       false,
                                                       true,
                                                       cap,
                                                       false,
                                                       true,
                                                       customer,
                                                       {from: factoryOwner}
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
        })

        it("#16 Make tokenPS", async () => {
            // make Token contract for customer
            tokenContract = (await Factory.createToken(name,
                                                       symbol,
                                                       decimals,
                                                       false,
                                                       false,
                                                       cap,
                                                       true,
                                                       true,
                                                       customer,
                                                       {from: factoryOwner}
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
        })
    }
)
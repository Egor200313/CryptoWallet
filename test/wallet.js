const WalletFactory = artifacts.require('WalletFactory');
const Wallet = artifacts.require('Wallet');
const ERC20Mock = artifacts.require('ERC20Mock');
const AnotherToken = artifacts.require('AnotherToken');

contract("WalletFactory, Wallet: create wallet and deposit", function (accounts) {
  it ("should create and deposit wallet", async function () {
    const factory = await WalletFactory.deployed();
    const token = await ERC20Mock.new(accounts[0], 10000);

    const User = accounts[0];

    await factory.createWallet(User, [], 0, {from: User});
    const walletAddress = await factory.wallets(User);
    const wallet = await Wallet.at(walletAddress);

    balance = await wallet.balanceOfToken(token.address, {from: User});
    assert.equal(balance.toNumber(), 0);

    // deposit tokens to wallet from EOA
    await token.approve(wallet.address, 1000, {from: User});
    await wallet.depositToken(token.address, 1000, {from: User});

    balance = await wallet.balanceOfToken(token.address, {from: User});
    assert.equal(balance.toNumber(), 1000);
  });
});

contract("Wallet: store different tokens", function (accounts) {
  it ("should store different tokens", async function () {
    const factory = await WalletFactory.deployed();
    const mockToken = await ERC20Mock.new(accounts[0], 10000);
    const anotherToken = await AnotherToken.new(accounts[0], 10);

    const User = accounts[0];

    await factory.createWallet(User, [], 0, {from: User});
    const walletAddress = await factory.wallets(User);
    const wallet = await Wallet.at(walletAddress);

    mockBalance = await wallet.balanceOfToken(mockToken.address, {from: User});
    assert.equal(mockBalance.toNumber(), 0);
    anotherBalance = await wallet.balanceOfToken(anotherToken.address, {from: User});
    assert.equal(anotherBalance.toNumber(), 0);

    // deposit tokens to wallet from EOA
    await mockToken.approve(wallet.address, 100, {from: User});
    await wallet.depositToken(mockToken.address, 100, {from: User});
    await anotherToken.approve(wallet.address, 1, {from: User});
    await wallet.depositToken(anotherToken.address, 1, {from: User});

    mockBalance = await wallet.balanceOfToken(mockToken.address, {from: User});
    assert.equal(mockBalance.toNumber(), 100);
    anotherBalance = await wallet.balanceOfToken(anotherToken.address, {from: User});
    assert.equal(anotherBalance.toNumber(), 1);
  });
});

contract("Wallet: send tokens", function (accounts) {
  it ("should send tokens", async function () {
    const factory = await WalletFactory.deployed();
    const mockToken = await ERC20Mock.new(accounts[0], 10000);

    const Alice = accounts[0];
    const Bob = accounts[1];

    await factory.createWallet(Alice, [], 0, {from: Alice});
    await factory.createWallet(Bob, [], 0, {from: Bob});

    const aliceAddress = await factory.wallets(Alice);
    const aliceWallet = await Wallet.at(aliceAddress);

    const bobAddress = await factory.wallets(Bob);
    const bobWallet = await Wallet.at(bobAddress)

    await mockToken.approve(aliceWallet.address, 1000, {from: Alice});
    await aliceWallet.depositToken(mockToken.address, 1000, {from: Alice});
    
    balance = await aliceWallet.balanceOfToken(mockToken.address, {from: Alice});
    assert.equal(balance.toNumber(), 1000);

    // transfer tokens from Alice wallet to Bob wallet
    await aliceWallet.sendToken(mockToken.address, bobWallet.address, 1000, {from: Alice});
    aliceBalance = await aliceWallet.balanceOfToken(mockToken.address, {from: Alice});
    assert.equal(aliceBalance.toNumber(), 0);

    bobBalance = await bobWallet.balanceOfToken(mockToken.address, {from: Bob});
    assert.equal(bobBalance.toNumber(), 1000);
  });
});

contract("Wallet: withdraw tokens", function (accounts) {
  it("should withdraw tokens", async function () {
    const factory = await WalletFactory.deployed();
    const mockToken = await ERC20Mock.new(accounts[0], 10000);

    const User = accounts[0];

    await factory.createWallet(User, [], 0, {from: User});

    const walletAddress = await factory.wallets(User);
    const wallet = await Wallet.at(walletAddress);

    await mockToken.approve(wallet.address, 1000, {from: User});
    await wallet.depositToken(mockToken.address, 1000, {from: User});

    balance = await mockToken.balanceOf(User);
    assert.equal(balance.toNumber(), 9000);
    balance = await wallet.balanceOfToken(mockToken.address, {from: User});
    assert.equal(balance.toNumber(), 1000);

    // withdraw tokens from wallet
    await wallet.withdrawToken(mockToken.address, 1000, {from: User});
    balance = await mockToken.balanceOf(User);
    assert.equal(balance.toNumber(), 10000);
    balance = await wallet.balanceOfToken(mockToken.address, {from: User});
    assert.equal(balance.toNumber(), 0);
  });
});

contract("Wallet: recovery", function (accounts) {
  it("should withdraw tokens", async function () {
    const factory = await WalletFactory.deployed();
    const mockToken = await ERC20Mock.new(accounts[0], 10000);

    const User = accounts[0];
    const Guardian1 = accounts[1];
    const Guardian2 = accounts[2];

    await factory.createWallet(User, [Guardian1, Guardian2], 2, {from: User});

    const walletAddress = await factory.wallets(User);
    const wallet = await Wallet.at(walletAddress);

    await mockToken.approve(wallet.address, 1000, {from: User});
    await wallet.depositToken(mockToken.address, 1000, {from: User});

    balance = await mockToken.balanceOf(User);
    assert.equal(balance.toNumber(), 9000);
    balance = await wallet.balanceOfToken(mockToken.address, {from: User});
    assert.equal(balance.toNumber(), 1000);

    await wallet.initRecovery(Guardian1, {from: Guardian1});
    await wallet.supportRecovery(Guardian1, {from: Guardian2});
    await wallet.execRecovery({from: Guardian1});


    // withdraw tokens from wallet to guardian
    await wallet.withdrawToken(mockToken.address, 1000, {from: Guardian1});
    balance = await mockToken.balanceOf(Guardian1);
    assert.equal(balance.toNumber(), 1000);
    balance = await wallet.balanceOfToken(mockToken.address, {from: Guardian1});
    assert.equal(balance.toNumber(), 0);
  });
});

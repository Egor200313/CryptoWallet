// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Wallet {

    address public owner;

    address[] public guardiansAddress;
    address[] public guardiansSupportedRecovery;
    uint256 public guardiansRequired;
    mapping(address => bool) public isGuardian;

    bool public inRecovery;
    uint256 public currentRecoveryRound;
    address public proposedOwner;
    struct Recovery {
        address proposedOwner;
        uint256 recoveryRound;
    }
    mapping(address => Recovery) public guardianToProposedRecovery;
    mapping(address => bool) public isSupporter;

    error RecoveryFail();

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyGuardian() {
        require(
            isGuardian[msg.sender],
            "Only guardian"
        );
        _;
    }

    modifier onlyInRecovery() {
        require(
            inRecovery, "Recovery mode required"
        );
        _;
    }

    modifier notInRecovery() {
        require(
            !inRecovery, "Unavailable during recovery"
        );
        _;
    }

    event RecoveryStarted(
        address indexed initiator,
        address indexed proposedOwner
    );

    event RecoverySupported(
        address indexed supporter,
        address indexed proposedOwner
    );

    event RecoveryFinished(
        address indexed oldOwner,
        address indexed newOwner
    );

    constructor (
        address _owner,
        address[] memory _guardiansAddress,
        uint256 _guardiansRequired
    ) {
        require(
            guardiansRequired <= _guardiansAddress.length,
            "Too much guardians"
        );

        for (uint256 i = 0; i < _guardiansAddress.length; i++) {
            require(
                !isGuardian[_guardiansAddress[i]],
                "Guardian already exists"
            );
            isGuardian[_guardiansAddress[i]] = true;
            guardiansAddress.push(_guardiansAddress[i]);
        }

        owner = _owner;
        guardiansRequired = _guardiansRequired;
    }

    function initRecovery(address _newOwner) external onlyGuardian notInRecovery {
        proposedOwner = _newOwner;
        currentRecoveryRound++;
        guardianToProposedRecovery[msg.sender] = Recovery(
            _newOwner,
            currentRecoveryRound
        );
        guardiansSupportedRecovery.push(msg.sender);
        isSupporter[msg.sender] = true;
        inRecovery = true;
        emit RecoveryStarted(msg.sender, _newOwner);
    }

    function supportRecovery(address _newOwner) external onlyGuardian onlyInRecovery {
        require(!isSupporter[msg.sender], "Sender is already a supporter");
        guardianToProposedRecovery[msg.sender] = Recovery(
            _newOwner,
            currentRecoveryRound
        );
        guardiansSupportedRecovery.push(msg.sender);
        emit RecoverySupported(msg.sender, _newOwner);
    }

    function execRecovery() external onlyGuardian onlyInRecovery {
        require(
            guardiansSupportedRecovery.length >= guardiansRequired,
            "Not enough supporters of recovery"
        );

        for (uint256 i = 0; i < guardiansSupportedRecovery.length; i++) {
            Recovery memory recovery = guardianToProposedRecovery[
                guardiansSupportedRecovery[i]
            ];

            if (recovery.proposedOwner != proposedOwner || recovery.recoveryRound != currentRecoveryRound) {
                revert RecoveryFail();
            }

            isSupporter[guardiansSupportedRecovery[i]] = false;
        }

        inRecovery = false;
        address oldOwner = owner;
        owner = proposedOwner;
        delete guardiansSupportedRecovery;
        delete proposedOwner;
        emit RecoveryFinished(oldOwner, owner);
    }
    
    function depositToken(IERC20 token, uint amount) public notInRecovery {
        token.transferFrom(msg.sender, address(this), amount);
    }

    function sendToken(IERC20 token, address to, uint amount) public onlyOwner notInRecovery {
        token.transfer(to, amount);
    }

    function balanceOfToken(IERC20 token) public onlyOwner view returns (uint) {
        return token.balanceOf(address(this));
    }
    
    function withdrawToken(IERC20 token, uint amount) public onlyOwner notInRecovery {
        token.transfer(msg.sender, amount);
    }
}

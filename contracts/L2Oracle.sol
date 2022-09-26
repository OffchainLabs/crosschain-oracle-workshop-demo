pragma solidity ^0.7.0;

import "arb-bridge-eth/contracts/bridge/interfaces/IInbox.sol";
import "@chainlink/contracts/src/v0.7/interfaces/AggregatorV3Interface.sol";
import "@uniswap/v3-periphery/contracts/libraries/OracleLibrary.sol";
import "./PriceOracleGetter.sol";

contract L2Oracle {
    struct PriceFeed {
        uint256 linkPrice;
        uint256 lastUpdatedAt;
    }

    PriceFeed public priceFeed;

    address public l1OracleAliased;
    address public uniOralceL2;
    address public chainlinkOracleL2;
    address public sequencerUptimeFeed;

    uint256 constant MAX_DRIFT = 60 * 60 * 24 * 7 * 356 * 10000;

    function initialize(
        address _l1OracleAliased,
        address _uniOralceL2,
        address _chainlinkOracleL2,
        address _sequencerUptimeFeed
    ) public {
        require(l1OracleAliased == address(0), "ALREADY_INIT");
        l1OracleAliased = _l1OracleAliased;
        uniOralceL2 = _uniOralceL2;
        chainlinkOracleL2 = _chainlinkOracleL2;
        sequencerUptimeFeed = _sequencerUptimeFeed;
    }
    
}

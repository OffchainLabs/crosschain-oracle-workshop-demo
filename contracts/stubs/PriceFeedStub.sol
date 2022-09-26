pragma solidity ^0.7.0;


contract PriceFeedStub {
    function latestRoundData () public returns (uint80, int256, uint256, uint256, uint80) {
        return (0, 1000, 12345, block.timestamp, 12345);
    }
}


    // uint80 roundId,
    // int256 answer,
    // uint256 startedAt,
    // uint256 updatedAt,
    // uint80 answeredInRoundundData();
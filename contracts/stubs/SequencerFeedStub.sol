pragma solidity ^0.7.0;


contract SequencerFeedStub {
    function latestRoundData () public returns (uint80, int256, uint256, uint256, uint80) {
        return (12345, 1, 12345, 12345, 12345);
    }
}


    // uint80 roundId,
    // int256 answer,
    // uint256 startedAt,
    // uint256 updatedAt,
    // uint80 answeredInRoundundData();
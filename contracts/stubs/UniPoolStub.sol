pragma solidity ^0.7.0;

contract UniPoolStub {
    int56[] public arr;
    uint160[] public arr2;

    constructor() public {
        arr.push(1);
        arr.push(2);
        arr2.push(1);
        arr2.push(2);
    }

    function observe(uint32 secondsAgo)
        public
        returns (
            int56[] memory tickCumulatives,
            uint160[] memory secondsPerLiquidityCumulativeX128s
        )
    {
        return (arr, arr2);
    }
}

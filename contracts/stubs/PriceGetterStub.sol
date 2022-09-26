pragma solidity ^0.7.0;

import "@chainlink/contracts/src/v0.7/interfaces/AggregatorV3Interface.sol";
import "@uniswap/v3-periphery/contracts/libraries/OracleLibrary.sol";

library PriceGetterStub {
    function getLinkPrices(
        address chainlinkOraclesAddress,
        address uniswapOracle
    )
        external
        view
        returns (
            uint256 uniswapPrice,
            uint256 chainlinkPrice,
            uint256 chianlinkPriceUpdatedAt
        )
    {
        return (2, 3, block.timestamp - 4);
    }
}

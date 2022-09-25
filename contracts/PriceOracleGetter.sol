pragma solidity ^0.7.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@uniswap/v3-periphery/contracts/libraries/OracleLibrary.sol";

library PriceOracleGetter {
    function getLinkPrices(
        address chainlinkOraclesAddress,
        address uniswapOracle
    )
        external
        returns (
            uint256 uniswapPrice,
            uint256 chainlinkPrice,
            uint256 chianlinkPriceUpdatedAt
        )
    {
        (, uint128 _uniswapPrice) = OracleLibrary.consult(uniswapOracle, 120);
        (
            /*uint80 roundID*/
            int256 _chainlinkPrice,
            ,
            uint256 chianlinkPriceUpdatedAt,
            ,

        ) = AggregatorV3Interface(chainlinkOraclesAddress).latestRoundData();
        uint256 uniswapPrice = uint256(_uniswapPrice);
        uint256 chainlinkPrice = uint256(_chainlinkPrice);
    }
}

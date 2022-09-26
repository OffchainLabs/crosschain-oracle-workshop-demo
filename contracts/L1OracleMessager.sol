// SPDX-License-Identifier: Apache-2.0

/*
 * Copyright 2020, Offchain Labs, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "arb-bridge-eth/contracts/bridge/interfaces/IInbox.sol";
import "./PriceOracleGetter.sol";
import "./L2Oracle.sol";

contract L1OracleMessager {
    address public l2Oracle;
    address public inbox;
    address public uniOracle;
    address public chainlinkOracle;

    function initialize(
        address _l2Oracle,
        address _inbox,
        address _chainlinkOracle,
        address _uniOracle
    ) public {
        require(l2Oracle == address(0), "ALREADY_INIT");
        require(_l2Oracle != address(0), "BAD_ORACLE");
        require(_inbox != address(0), "BAD_INBOX");

        inbox = _inbox;
        l2Oracle = _l2Oracle;
        uniOracle = _uniOracle;
        chainlinkOracle = _chainlinkOracle;
    }

    function sendOracleDataToL2(
        uint256 maxSubmissionCost,
        uint256 l2GasLimit,
        uint256 maxFeePerL2Gas,
        address refundAddress
    ) public payable returns (uint256) {
        bytes memory l2MessageCallData = getL2RetryableCalldata();
        return IInbox(inbox).createRetryableTicket{value: msg.value}(
            l2Oracle,
            0,
            maxSubmissionCost,
            refundAddress,
            refundAddress,
            l2GasLimit,
            maxFeePerL2Gas,
            l2MessageCallData
        );
    }

    function getL2RetryableCalldata() public view returns (bytes memory) {
        (
            uint256 uniswapPrice,
            uint256 chainlinkPrice,
            uint256 chainlinkPriceUpdatedAt
        ) = PriceOracleGetter.getLinkPrices(uniOracle, chainlinkOracle);

        return
            abi.encodeWithSelector(
                L2Oracle.receiveOracleDataFromL1.selector,
                uniswapPrice + chainlinkPrice,
                chainlinkPriceUpdatedAt
            );
    }
}

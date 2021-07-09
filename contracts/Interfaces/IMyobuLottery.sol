// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./IERC20.sol";
import "../Chainlink/interfaces/LinkTokenInterface.sol";

/**
 * @title Myobu Lottery Interface
 * @author Myobu Devs
 */
interface IMyobuLottery {
    /**
     * @dev Event emmited when tickets are bought
     * @param buyer: The address of the buyer
     * @param amount: The amount of tickets bought
     * @param price: The price of each ticket
     * */
    event TicketsBought(address buyer, uint256 amount, uint256 price);

    /**
     * @dev Event emmited when fees are claimed
     * @param amountClaimed: The amount of fees claimed in ETH
     * @param claimer: The address that claimed the fees
     */
    event FeesClaimed(uint256 amountClaimed, address claimer);

    /**
     * @dev Event emmited when a lottery is created
     * @param lotteryID: The ID of the lottery created
     * @param lotteryLength: How long the lottery will be in seconds
     * @param ticketPrice: The price of a ticket in ETH
     * @param ticketFee: The percentage of the ticket price that is sent to the fee receiver
     * @param minimumMyobuBalance: The minimum amount of Myobu someone needs to buy tickets or get rewarded
     * @param percentageToKeepForNextLottery: The percentage that will be kept as reward for the next lottery
     */
    event LotteryCreated(
        uint256 lotteryID,
        uint256 lotteryLength,
        uint256 ticketPrice,
        uint256 ticketFee,
        uint256 minimumMyobuBalance,
        uint256 percentageToKeepForNextLottery
    );

    /**
     * @dev Event emmited when the someone wins the lottery
     * @param winner: The address of the the lottery winner
     * @param amountWon: The amount of ETH won
     * @param tokenID: The winning tokenID
     */
    event LotteryWon(address winner, uint256 amountWon, uint256 tokenID);

    /**
     * @dev Event emitted when the lottery is extended
     * @param extendedBy: The amount of seconds the lottery is extended by
     */
    event LotteryExtended(uint256 extendedBy);

    /**
     * @dev Struct of a lottery
     * @param startingTokenID: The token ID that the lottery starts at
     * @param startTimestamp: A timestamp of when the lottery started
     * @param endTimestamp: A timestamp of when the lottery will end
     * @param ticketPrice: The price of a ticket in ETH
     * @param ticketFee: The percentage of ticket sales that go to the _feeReceiver
     * @param minimumMyobuBalance: The minimum amount of myobu you need to buy tickets
     * @param percentageToKeepForNextLottery: The percentage of the jackpot to keep for the next lottery
     */
    struct Lottery {
        uint256 startingTokenID;
        uint256 startTimestamp;
        uint256 endTimestamp;
        uint256 ticketPrice;
        uint256 ticketFee;
        uint256 minimumMyobuBalance;
        uint256 percentageToKeepForNextLottery;
    }

    /**
     * @dev Buys lottery tickets with ETH
     */
    function buyTickets() external payable;

    /**
     * @return The amount of unclaimed fees, can be claimed using claimFees()
     */
    function unclaimedFees() external view returns (uint256);

    /**
     * @dev Function that claims fees and sends to _feeReceiver.
     */
    function claimFees() external;

    /**
     * @dev Function that gets a random winner and sends the reward
     */
    function claimReward() external returns (bytes32 requestId);

    /**
     * @return The current jackpot
     */
    function jackpot() external view returns (uint256);

    /**
     * @return The current token being used
     */
    function myobu() external view returns (IERC20);

    /**
     * @return The amount of link to pay
     */
    function chainlinkFee() external view returns (uint256);

    /**
     * @return Where all the ticket sale fees will be sent to
     */
    function feeReceiver() external view returns (address);

    /**
     * @return A counter of how much lotteries there have been, increases by 1 each new lottery.
     */
    function currentLotteryID() external view returns (uint256);

    /**
     * @return The info of a lottery (The Lottery Struct)
     */
    function lottery(uint256 lotteryID) external view returns (Lottery memory);

    /**
     * @return Returns if the reward has been claimed for the current lottery
     */
    function rewardClaimed() external view returns (bool);

    /**
     * @return The last tokenID that fees have been claimed on for the current lottery
     */
    function lastClaimedTokenID() external view returns (uint256);
}

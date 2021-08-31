import { BigNumber, Contract } from 'ethers'
import { Signer } from '@ethersproject/abstract-signer'
import { Provider, TransactionResponse } from '@ethersproject/abstract-provider'

// TODO: USE THE SDK. THIS IS ALL TEMPORARY.

// Simulation specific

export interface User {
  address: string
  balance: BigNumber
  pickIndices: BigNumber[]
}

export interface DrawSimulationResult {
  draw: Draw // think all we need from this is the winningRandomNumber
  user: User // need address - do we need pickIndices?
  drawSettings: DrawSettings
  results: DrawResults
}

export interface DrawSimulationResults {
  results: DrawSimulationResult[][]
}

// External interface

export interface DrawSettings {
  matchCardinality: BigNumber
  pickCost: BigNumber
  distributions: BigNumber[]
  bitRangeSize: BigNumber
}

export interface DrawResults {
  totalAmountUnformatted: BigNumber
  prizes: ClaimablePickPrize[]
}

export interface ClaimablePickPrize extends PickPrize {
  pickIndex: number
  drawId: number
}

export interface PickPrize {
  amountUnformatted: BigNumber
  distributionIndex: number
}

// New stuff

// - This is all class based. Just a personal preference (and partially copying Compound
// https://compound.finance/docs/compound-js) we could make it all individual functions,
// but then the user is just going to need to pass a lot more data all of the time.
// Ex. passing provider, prize pool address, prize strat address, etc. every fn call.
// - We need to fetch strat & version (and/or provide the users some consts) BEFORE making an instance of Tsunami.
// Otherwise we would need to fetch that data all the time or deal with some ugly mutations that
// might interfere with Reacts state.

/**
 *
 * ////// v0 User flow //////
 * const tsunamiPrizePoolConfig = await getPrizePoolConfig(prizePoolAddress)
 * const tsunamiPrizePool = new Tsunami(provider, tsunamiPrizePoolConfig)
 *
 * OR
 *
 * // We can supply a const of configs.
 * const tsunamiPrizePoolConfig = await getPrizePoolConfig(prizePoolAddress)
 * const tsunamiPrizePool = new Tsunami(provider, {
 *  prizePoolAddress,
 *  prizePoolStrategyAddress,
 *  '0.0.1'
 * })
 *
 */

/**
 * More nice to haves - might be more relevant for a PoolTogether SDK rather than Tsunami SDK
 * - Relevant Token data
 *      - Ticket, supply, underlying
 *      - Name, symbol, decimals, total supply
 * - PT API static calls?
 *      - Get estimated USD value of a token
 *      - Get estimated Prize could go here?
 *      - Cached data (did the user 0xabc win for draw # 14)
 * - Users ticket balances (not tsunami specific)
 *      - Fetches across multiple prize pools
 * - Governance methods
 *      - POOL methods
 */

/**
 * Enum for validating a supplied version of Tsunami.
 * Versions are used to match abis.
 */
export enum TsunamiVersion {
  '0.0.1' = '0.0.1'
}

/**
 * An instance of a draw
 */
export interface Draw {
  id: number
  totalAwardAmount: BigNumber
  winningRandomNumber: BigNumber
  timestamp: number
}

/**
 * The possible states a prize period can be in
 */
export enum PrizePeriodStates {
  active = 'active', // !canStartAward && !canCompleteAward
  canStartAward = 'canStartAward', // canStartAward
  canCompleteAward = 'canCompleteAward' // canCompleteAward
}

export interface PrizeDistribution extends Draw {
  prizes: PickPrize[] // Tiers of prizes. 0 index is grand prize.
}

/**
 * A view into a prize period.
 * Currently I expect this to only be used for the current prize period as Draws are more
 * important when looking at historic data
 */
export interface CurrentPrizePeriod {
  drawId: number // TODO: nextDrawId from ClaimableDraw?
  // prizeEstimate: BigNumber TODO: ????
  state: PrizePeriodStates
  // Passthrough data from chain reads
  _prizePeriodSeconds: number
  _prizePeriodRemainingSeconds: number
  _prizePeriodStartedAt: number
  _canStartAward: boolean
  _canCompelteAward: boolean
  _isRngRequested: boolean
  _isRngTimedOut: boolean
  _isRngCompleted: boolean
}

/**
 * Minimal config to be able to query all of the data needed for a Tsunami app
 */
export interface PrizePoolConfig {
  prizePoolAddress: string
  prizeStrategyAddress: string
  version: TsunamiVersion
}

/**
 * Main class for reading Tsunami Prize Pool Data.
 */
export declare class Tsunami implements PrizePoolConfig {
  // Data
  provider: Provider
  prizePoolAddress: string
  prizeStrategyAddress: string
  // version: So we can determine which abi to use.
  version: TsunamiVersion
  prizePoolContract: Contract
  prizeStrategyContract: Contract

  // Constructor
  constructor(provider: Provider, prizePoolConfig: PrizePoolConfig)

  // Methods - (requires an instance of Tsunami)
  getDraw(drawId: number): Draw
  getPrizeDistribution(drawId: number): PrizeDistribution // Can I even get this for the current prize period?
  getCurrentPrizePeriod(): CurrentPrizePeriod
  getUsersDrawResults(usersAddress: string, drawId: number): DrawResults
  getUsersBalances(usersAddress: string): { [tokenAddress: string]: BigNumber }
  getUsersBalance(usersAddress: string, tokenAddress: string): BigNumber
  getClaimableDrawIds(): number[]

  // Static methods - (don't require an instance of Tsunami)
  static getPrizePoolConfig(prizePoolAddress: string): PrizePoolConfig
  static getPrizeStrategyAddress(prizePoolAddress: string): string
  static getPrizePoolVersion(prizePoolAddress: string): TsunamiVersion
  // Maybe a better name? Any more of these needed for backend sim testing? Just export these fns themselves?
  static runDrawCalculatorForSingleDraw(
    drawSettings: DrawSettings,
    draw: Draw,
    user: User
  ): DrawResults

  // static getTokenFaucets: Might not be necessary for v0. Return token faucets straight from the contract.
  // Users might want historic token faucets that have expired one day, we'll need a db, KV,
  // or to do some log digging.
  // getTokenFaucets: () => string[]
}

/**
 * Main class for a user to interact with a Tsunami Prize Pool
 */
export declare class TsunamiPlayer {
  signer: Signer
  tsunami: Tsunami

  constructor(signer: Signer, tsunami: Tsunami)

  // Methods
  getTokenBalances(): { [tokenAddress: string]: BigNumber }
  getTokenBalance(tokenAddress: string): BigNumber
  getClaimableDraws(): Promise<Draw[]>
  deposit(amount: BigNumber): Promise<TransactionResponse>
  withdraw(amount: BigNumber): Promise<TransactionResponse>

  // getTokenBalances(): TokenBalancesResponse
}

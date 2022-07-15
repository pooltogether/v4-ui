import { BigNumber } from '@ethersproject/bignumber'

interface Account {
  id: string
  promotions: Array<Promotion>
  claimedPromotions: Array<ClaimedPromotion>
  ticket: Array<Ticket>
}

interface Ticket {
  id: string
  accounts: Array<Account>
  promotions: Array<Promotion>
}

export interface Epoch {
  epochStartTimestamp: number
  epochEndTimestamp: number
}

export interface EpochCollection {
  epochs: Array<Epoch>
  remainingEpochsArray: Array<Epoch>
}

export interface Promotion {
  id: string
  chainId: number
  creator: string
  token: string
  tokensPerEpoch: BigNumber
  remainingEpochs: number
  startTimestamp: number
  epochDuration: number
  numberOfEpochs: number
  currentEpochId: string
  createdAt: number
  destroyedAt: number
  endedAt: number
  maxCompletedEpochId: number
  rewardsUnclaimed: number
  epochCollection: EpochCollection
  ticket: Ticket
}

export interface ClaimedPromotion {
  id: string
  promotionId: string
  epochs: [string]
  rewards: string
}

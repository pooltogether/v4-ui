import { bigNumberify } from 'ethers/utils'

import { calculateUsersFractionOfWinnings } from '../calculateUsersFractionOfWinnings'

describe('calculateUsersFractionOfWinnings', () => {
  const queries = {
    podUserQuery: {
      balanceUnderlying: bigNumberify('38000000000000000000'),
      pendingDeposit: bigNumberify('830000000000000000000'),
    },
    podPoolUserQuery: {
      committedBalanceOf: bigNumberify('20000000000000000000000'),
      openBalanceOf: bigNumberify('10000000000000000000000'),
    },
  }

  it('calculates and returns the users podShare fraction', () => {
    const result = calculateUsersFractionOfWinnings(
      '0',
      18,
      bigNumberify('500000000000000000000'),
      queries.podUserQuery,
      queries.podPoolUserQuery
    )

    expect(result.toString()).toEqual('14466666500000000000')
  })

  it('takes an additional amount into account (ie. if buying more tickets)', () => {
    const result = calculateUsersFractionOfWinnings(
      '2000',
      18,
      bigNumberify('500000000000000000000'),
      queries.podUserQuery,
      queries.podPoolUserQuery
    )

    expect(result.toString()).toEqual('44812500000000000000')
  })
})

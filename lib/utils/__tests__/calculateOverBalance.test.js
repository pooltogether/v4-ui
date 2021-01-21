import { ethers } from 'ethers'

import { calculateOverBalance } from '../calculateOverBalance'

const bn = ethers.utils.bigNumberify

describe('calculateOverBalance', () => {
  let erc20UserQuery = {
    decimals: 18,
    loading: false,
  }

  it('returns null if query loading', () => {
    erc20UserQuery = {
      ...erc20UserQuery,
      loading: true,
    }

    expect(calculateOverBalance(erc20UserQuery, null, null)).toEqual(null)
  })

  it('returns true if user has not enough funds', () => {
    erc20UserQuery = {
      ...erc20UserQuery,
      loading: false,
    }

    const purchaseAmount = '2'
    const userBalance = bn('1000000000000000000')

    expect(calculateOverBalance(erc20UserQuery, purchaseAmount, userBalance)).toEqual(true)
  })

  it('returns false if they good to go', () => {
    erc20UserQuery = {
      ...erc20UserQuery,
      loading: false,
    }

    const purchaseAmount = '1'
    const userBalance = bn('2000000000000000000')

    expect(calculateOverBalance(erc20UserQuery, purchaseAmount, userBalance)).toEqual(false)
  })
})

import { TokenBalance, useRefetchInterval } from '.yalc/@pooltogether/hooks/dist'
import { Player } from '.yalc/@pooltogether/v4-js-client/dist'
import { formatUnits } from '@ethersproject/units'
import { numberWithCommas } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'
import { useQuery, UseQueryOptions } from 'react-query'
import { usePrizePoolTokens } from '../PrizePool/usePrizePoolTokens'

export interface PlayersBalances {
  ticket: TokenBalance
  token: TokenBalance
}

export const usePlayersBalances = (player: Player) => {
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } = usePrizePoolTokens(player)
  const refetchInterval = useRefetchInterval(player?.chainId)

  const enabled = Boolean(player) && isPrizePoolTokensFetched

  return useQuery(
    'playersBalance',
    async () => {
      const ticketBalancePromise = player.getBalanceOfTicket()
      const tokenBalancePromise = player.getBalanceOfToken()
      const ticketTotalSupplyPromise = player.ticketContract.totalSupply()
      const tokenTotalSupplyPromise = player.tokenContract.totalSupply()
      const { ticket: ticketData, token: tokenData } = prizePoolTokens

      const [ticketBalance, tokenBalance, ticketTotalSupply, tokenTotalSupply] = await Promise.all([
        ticketBalancePromise,
        tokenBalancePromise,
        ticketTotalSupplyPromise,
        tokenTotalSupplyPromise
      ])

      const ticket: TokenBalance = {
        ...ticketData,
        hasBalance: !ticketBalance.isZero(),
        amount: formatUnits(ticketBalance, ticketData.decimals),
        amountUnformatted: ticketBalance,
        amountPretty: prettyNumber(ticketBalance, ticketData.decimals) as string,
        totalSupply: formatUnits(ticketTotalSupply, ticketData.decimals),
        totalSupplyUnformatted: ticketTotalSupply,
        totalSupplyPretty: prettyNumber(ticketTotalSupply, ticketData.decimals) as string
      }

      const token: TokenBalance = {
        ...tokenData,
        hasBalance: !tokenBalance.isZero(),
        amount: formatUnits(tokenBalance, tokenData.decimals),
        amountUnformatted: tokenBalance,
        amountPretty: prettyNumber(tokenBalance, tokenData.decimals) as string,
        totalSupply: formatUnits(tokenTotalSupply, tokenData.decimals),
        totalSupplyUnformatted: tokenTotalSupply,
        totalSupplyPretty: prettyNumber(tokenTotalSupply, tokenData.decimals) as string
      }

      return {
        ticket,
        token
      } as PlayersBalances
    },
    { refetchInterval, enabled } as UseQueryOptions<PlayersBalances>
  )
}

const prettyNumber = (amount: BigNumber, decimals: string) => numberWithCommas(amount, { decimals })

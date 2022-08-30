import FeatherIcon from 'feather-icons-react'
import { DetailedHTMLProps, SelectHTMLAttributes, useMemo, useState } from 'react'
import { SidebarCard } from '.'
import { useUsersPrizePoolNetworkOdds } from '@hooks/v4/PrizePoolNetwork/useUsersPrizePoolNetworkOdds'
import {
  getNetworkNiceNameByChainId,
  numberWithCommas,
  unionProbabilities
} from '@pooltogether/utilities'
import { NetworkIcon, ThemedClipSpinner } from '@pooltogether/react-components'
import { usePrizePoolByChainId } from '@hooks/v4/PrizePool/usePrizePoolByChainId'
import { usePrizePoolTicketDecimals } from '@hooks/v4/PrizePool/usePrizePoolTicketDecimals'
import { useSpoofedPrizePoolNetworkOdds } from '@hooks/v4/PrizePoolNetwork/useSpoofedPrizePoolNetworkOdds'
import { useAppEnvString } from '@hooks/useAppEnvString'
import { V4_CHAIN_IDS } from '@constants/config'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { TransparentSelect } from '@components/Input/TransparentSelect'
import { usePrizePoolPrizes } from '@hooks/v4/PrizePool/usePrizePoolPrizes'
import { PrizePool } from '@pooltogether/v4-client-js'

export const OddsSidebarCard: React.FC<{ usersAddress: string }> = (props) => {
  const { usersAddress } = props

  if (!usersAddress) {
    return <OddsOfWinningWithX />
  }

  return (
    <SidebarCard
      title={'🎲 Winning odds'}
      description={'Odds of winning at least one prize*'}
      main={<UserOddsOfWinning usersAddress={usersAddress} />}
    />
  )
}

const UserOddsOfWinning: React.FC<{ usersAddress: string }> = (props) => {
  const { usersAddress } = props
  const { data, isFetched } = useUsersPrizePoolNetworkOdds(usersAddress)
  return <OddsOfWinning odds={data?.odds} oneOverOdds={data?.oneOverOdds} isFetched={isFetched} />
}

const AMOUNT_OPTIONS = Object.freeze(['10', '100', '1000', '10000'])

export const OddsOfWinningWithX: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  const appEnv = useAppEnvString()

  const { chainId: selectedChainId } = useSelectedChainId()
  const [chainId, setChainId] = useState(selectedChainId)
  const prizePool = usePrizePoolByChainId(chainId)
  const { data: decimals } = usePrizePoolTicketDecimals(prizePool)
  const [amount, setAmount] = useState('1000')
  const { data, isFetched } = useSpoofedPrizePoolNetworkOdds(amount, decimals, prizePool.id())

  return (
    <SidebarCard
      title={'🎲 Winning odds'}
      className={className}
      description={
        <>
          Odds of a deposit of{' '}
          <TransparentSelect
            name='amount'
            id='amount'
            onChange={(event) => setAmount(event.target.value)}
            value={amount}
          >
            {AMOUNT_OPTIONS.map((amount) => (
              <option key={amount} value={amount}>
                ${numberWithCommas(amount, { precision: 0 })}
              </option>
            ))}
          </TransparentSelect>{' '}
          winning at least one prize in the{' '}
          <TransparentSelect
            name='chainId'
            id='chainId'
            onChange={(event) => setChainId(Number(event.target.value))}
            value={chainId}
          >
            {V4_CHAIN_IDS[appEnv].map((chainId) => (
              <option key={chainId} value={chainId}>
                {getNetworkNiceNameByChainId(chainId)}
              </option>
            ))}
          </TransparentSelect>{' '}
          prize pool
        </>
      }
      main={
        <>
          <OddsOfWinning
            odds={data?.odds}
            oneOverOdds={data?.oneOverOdds}
            isFetched={isFetched}
            prizePool={prizePool}
          />
        </>
      }
    />
  )
}

const OddsOfWinning: React.FC<{
  odds: number
  oneOverOdds: number
  isFetched: boolean
  prizePool: PrizePool
}> = (props) => {
  const { odds, oneOverOdds, isFetched, prizePool } = props

  const weeklyOneOverOdds = useMemo(() => {
    if (!isFetched) return null
    const totalOdds = unionProbabilities(...Array(7).fill(odds))
    if (totalOdds === 0) return Infinity
    const oneOverOdds = 1 / totalOdds
    return Number(oneOverOdds.toFixed(2)) < 1.01 ? 1 : oneOverOdds
  }, [isFetched, odds])

  const { data, isFetched: isPrizeFetched } = usePrizePoolPrizes(prizePool)

  return (
    <ul className='font-normal text-xs'>
      <li className='flex justify-between'>
        <span>Daily</span>
        {isFetched && !!oneOverOdds && !isNaN(oneOverOdds) ? (
          <span className='font-bold'>
            {oneOverOdds === Infinity ? '0 😔' : `1:${oneOverOdds.toFixed(2)}`}
          </span>
        ) : (
          <ThemedClipSpinner sizeClassName='w-4 h-4' />
        )}
      </li>
      <li className='flex justify-between'>
        <span>Weekly</span>
        {isFetched && !!weeklyOneOverOdds && !isNaN(weeklyOneOverOdds) ? (
          <span className='font-bold'>
            {weeklyOneOverOdds === Infinity ? '0 😭' : `1:${weeklyOneOverOdds.toFixed(2)}`}
          </span>
        ) : (
          <ThemedClipSpinner sizeClassName='w-4 h-4' />
        )}
      </li>
      <li className='flex justify-between'>
        <span>Average Prize Value</span>
        {isPrizeFetched ? (
          <span className='font-bold'>${data.averagePrizeValue.amountPretty}</span>
        ) : (
          <ThemedClipSpinner sizeClassName='w-4 h-4' />
        )}
      </li>
    </ul>
  )
}

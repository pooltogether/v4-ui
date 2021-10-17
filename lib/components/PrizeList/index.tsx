import classnames from 'classnames'
import ordinal from 'ordinal'
import { useTranslation } from 'react-i18next'
import { Token } from '@pooltogether/hooks'
import { PrizeAwardable, PrizeDistribution } from '@pooltogether/v4-js-client'

import { TokenSymbolAndIcon } from 'lib/components/TokenSymbolAndIcon'
import { getAmountFromBigNumber } from 'lib/utils/getAmountFromBigNumber'
import { roundPrizeAmount } from 'lib/utils/roundPrizeAmount'
import { sortByBigNumber } from 'lib/utils/sortByBigNumber'

interface PrizeListProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement> {
  chainId: number
  prizeDistribution: PrizeDistribution
  prizes: PrizeAwardable[]
  ticket: Token
  token: Token
}

export const PrizeList = (props: PrizeListProps) => {
  const { prizes, ticket, token, className, prizeDistribution, ...ulProps } = props

  return (
    <ul {...ulProps} className={classnames(className, 'text-white max-h-80 overflow-y-auto pr-2')}>
      {!prizes &&
        Array.from(Array(3)).map((_, i) => <LoadingPrizeRow key={`prize-loading-row-${i}`} />)}
      {prizes?.sort(sortByPrizeAmount).map((prize) => (
        <PrizeRow
          {...props}
          key={prize.pick.toString()}
          prize={prize}
          token={token}
          ticket={ticket}
          prizeDistribution={prizeDistribution}
        />
      ))}
    </ul>
  )
}

const sortByPrizeAmount = (a: PrizeAwardable, b: PrizeAwardable) =>
  sortByBigNumber(a.amount, b.amount)

interface PrizeRowProps {
  chainId: number
  prize: PrizeAwardable
  ticket: Token
  token: Token
  prizeDistribution: PrizeDistribution
}

const PrizeRow = (props: PrizeRowProps) => {
  const { chainId, prize, ticket, token, prizeDistribution } = props
  const { amount: amountUnformatted, distributionIndex } = prize

  const { t } = useTranslation()

  const { tiers } = prizeDistribution
  const filteredTiers = tiers.filter((tierValue) => tierValue > 0)
  const tierIndex = filteredTiers.indexOf(tiers[distributionIndex])

  const { amountPretty } = roundPrizeAmount(amountUnformatted, ticket.decimals)

  return (
    <li
      className={classnames('flex mb-2 flex-row text-center rounded-lg last:mb-0 text-xxs', {
        'bg-light-purple-10': tierIndex !== 0,
        'pool-gradient-3 ': tierIndex === 0
      })}
    >
      <div
        className={classnames(
          'flex rounded-lg flex-row w-full justify-between space-x-2 py-2 px-4 sm:px-6',
          {
            'bg-actually-black bg-opacity-60': tierIndex === 0
          }
        )}
      >
        <span className='flex items-center '>
          <span className='mr-2'>{amountPretty}</span>{' '}
          <TokenSymbolAndIcon chainId={chainId} token={ticket} />
        </span>
        <span>{`${ordinal(tierIndex + 1)} ${t('tier', 'Tier')}${getEmoji(tierIndex)}`}</span>
      </div>
    </li>
  )
}

const getEmoji = (distributionIndex) => {
  return ' 🏆'

  if (distributionIndex === 0) {
    return ' 🏆'
  } else if (distributionIndex === 1) {
    return ' 🥈'
  } else if (distributionIndex === 2) {
    return ' 🥉'
  }
  return ''
}

const LoadingPrizeRow = () => <li className='w-full h-6 animate-pulse bg-darkened rounded-xl' />

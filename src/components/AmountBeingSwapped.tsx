import { Token, Amount } from '@pooltogether/hooks'
import { TokenIcon } from '@pooltogether/react-components'
import { getMaxPrecision, numberWithCommas } from '@pooltogether/utilities'
import classNames from 'classnames'
import { DownArrow } from './DownArrow'

interface AmountBeingSwappedProps {
  title: string
  chainId: number
  from: Token
  to: Token
  amountFrom: Amount
  amountTo: Amount
  isSummary?: boolean
}

export const AmountBeingSwapped = (props: AmountBeingSwappedProps) => {
  const { title, chainId, from, to, amountFrom, amountTo, isSummary } = props

  const fontSizeClassNames = isSummary ? 'text-xs' : 'text-xs xs:text-lg'
  const inputBoxPaddingClassNames = isSummary ? 'p-2' : 'p-2 xs:p-4'
  const inputBoxDefaultClassNames =
    'flex justify-between items-center border-pt-purple-light dark:border-pt-purple-darkest'

  return (
    <div>
      {!isSummary && <span className='mb-3 font-bold opacity-50 uppercase'>{title}</span>}

      <div
        className={classNames(
          fontSizeClassNames,
          'bg-pt-purple-lighter dark:bg-pt-purple-dark border-2 border-pt-purple-light dark:border-pt-purple-darkest rounded-lg relative font-bold'
        )}
      >
        <div className='absolute inset-0 flex justify-center'>
          <div className='bg-pt-purple-light dark:bg-pt-purple-darkest rounded-full p-2 h-fit-content my-auto'>
            <DownArrow className='text-inverse' />
          </div>
        </div>
        <div
          className={classNames('border-b', inputBoxPaddingClassNames, inputBoxDefaultClassNames)}
        >
          <TokenAndSymbol isSummary={isSummary} chainId={chainId} token={from} />
          <span>
            {numberWithCommas(amountFrom.amount, { precision: getMaxPrecision(amountFrom.amount) })}
          </span>
        </div>
        <div
          className={classNames('border-t', inputBoxPaddingClassNames, inputBoxDefaultClassNames)}
        >
          <TokenAndSymbol isSummary={isSummary} chainId={chainId} token={to} />
          <span>
            {numberWithCommas(amountTo.amount, { precision: getMaxPrecision(amountTo.amount) })}
          </span>
        </div>
      </div>
    </div>
  )
}

const TokenAndSymbol = (props: { chainId: number; token: Token; isSummary?: boolean }) => {
  const { chainId, token, isSummary } = props

  const iconSizeClassNames = isSummary ? 'w-4 h-4' : 'w-6 h-6'

  return (
    <div className={classNames('flex items-center', 'placeholder-white placeholder-opacity-50')}>
      <TokenIcon
        sizeClassName={iconSizeClassNames}
        className='mr-2'
        chainId={chainId}
        address={token.address}
      />
      <span>{token.symbol}</span>
    </div>
  )
}

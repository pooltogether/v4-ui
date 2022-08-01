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
}

export const AmountBeingSwapped = (props: AmountBeingSwappedProps) => {
  const { title, chainId, from, to, amountFrom, amountTo } = props
  return (
    <div>
      <span className='mb-3 font-bold opacity-50 uppercase'>{title}</span>
      <div className='bg-pt-purple-lighter dark:bg-pt-purple-dark border-2 border-pt-purple-light dark:border-pt-purple-darkest rounded-lg relative text-xs xs:text-lg font-bold'>
        <div className='absolute inset-0 flex justify-center'>
          <div className='bg-pt-purple-light dark:bg-pt-purple-darkest rounded-full p-2 h-fit-content my-auto'>
            <DownArrow className='text-inverse' />
          </div>
        </div>
        <div className='flex justify-between items-center border-b border-pt-purple-light dark:border-pt-purple-darkest p-2 xs:p-4'>
          <TokenAndSymbol chainId={chainId} token={from} />
          <span>
            {numberWithCommas(amountFrom.amount, { precision: getMaxPrecision(amountFrom.amount) })}
          </span>
        </div>
        <div className='flex justify-between items-center border-t border-pt-purple-light dark:border-pt-purple-darkest p-2 xs:p-4'>
          <TokenAndSymbol chainId={chainId} token={to} />
          <span>
            {numberWithCommas(amountTo.amount, { precision: getMaxPrecision(amountTo.amount) })}
          </span>
        </div>
      </div>
    </div>
  )
}

const TokenAndSymbol = (props: { chainId: number; token: Token }) => {
  const { chainId, token } = props
  return (
    <div className={classNames('flex items-center', 'placeholder-white placeholder-opacity-50')}>
      <TokenIcon
        sizeClassName='w-6 h-6'
        className='mr-2'
        chainId={chainId}
        address={token.address}
      />
      <span>{token.symbol}</span>
    </div>
  )
}

import { Amount, Token } from '@pooltogether/hooks'

import { TokenSymbolAndIcon } from '@components/TokenSymbolAndIcon'

interface AmountToReceiveProps {
  chainId: number
  amount: Amount
  token: Token
}

export const AmountToReceive = (props: AmountToReceiveProps) => {
  const { chainId, amount, token } = props

  return (
    <div className='w-full py-4 px-8 trans leading-none border-2 rounded-lg flex flex-row justify-between cursor-not-allowed  font-semibold text-accent-4 border-body bg-body'>
      <TokenSymbolAndIcon chainId={chainId} token={token} className='text-inverse text-lg' />
      <span className='text-xl tracking-normal'>{amount?.amount || '0.0'}</span>
    </div>
  )
}

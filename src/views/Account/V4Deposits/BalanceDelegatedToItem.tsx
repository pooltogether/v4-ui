import { PrizePoolDepositBalance } from '@components/PrizePoolDepositList/PrizePoolDepositBalance'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { useSelectedPrizePoolTicket } from '@hooks/v4/PrizePool/useSelectedPrizePoolTicket'
import { useTotalAmountDelegatedTo } from '@hooks/v4/PrizePool/useTotalAmountDelegatedTo'
import { Amount } from '@pooltogether/hooks'
import { BottomSheet, NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import React, { useState } from 'react'
import { useTranslation } from 'next-i18next'

// TODO: Bottom sheet for this showing breakdown
export const BalanceDelegatedToItem: React.FC<{ usersAddress: string }> = (props) => {
  const { usersAddress } = props

  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { chainId } = useSelectedChainId()
  const { data, isFetched, isError } = useTotalAmountDelegatedTo(usersAddress)

  if (isError || !isFetched || data?.delegatedAmount.amountUnformatted.isZero()) return null

  return (
    <li className='transition bg-white bg-opacity-70 hover:bg-opacity-100 dark:bg-actually-black dark:bg-opacity-10 dark:hover:bg-opacity-20 rounded-lg'>
      <button
        className='px-4 py-2 w-full flex justify-between items-center'
        onClick={() => setIsOpen(true)}
      >
        <span className='flex items-center font-bold text-xs space-x-2 text-left w-1/2'>
          <span>{'🎁 '}</span>
          <span className='leading-none'>{t('totalDelegatedToYou', 'Total delegated to you')}</span>
        </span>

        <PrizePoolDepositBalance chainId={chainId} token={data.totalTokenWithUsdBalance} />
      </button>
      <BalanceDelegatedToSheet
        delegatedAmountPerChain={data.delegatedAmountPerChain}
        isOpen={isOpen}
        onDismiss={() => setIsOpen(false)}
      />
    </li>
  )
}

const BalanceDelegatedToSheet: React.FC<{
  delegatedAmountPerChain: {
    chainId: number
    amount: Amount
  }[]
  isOpen: boolean
  onDismiss: () => void
}> = (props) => {
  const { isOpen, onDismiss, delegatedAmountPerChain } = props
  const { t } = useTranslation()

  return (
    <BottomSheet
      label='balance-delegated-to-sheet'
      open={isOpen}
      onDismiss={onDismiss}
      className='flex flex-col'
    >
      <div className='mx-auto text-2xl font-bold text-inverse mb-2'>
        {t('delegationsToYou', 'Delegations to you')}
      </div>
      <p className='opacity-70 text-xs text-center mb-6'>
        {t(
          'delegationDescription',
          'Other people can delegate their chances of winning to you. This is typically used for winners of competitions or for charity.'
        )}
      </p>
      <ul className='bg-body p-4 rounded space-y-4'>
        {delegatedAmountPerChain.map((data) => (
          <DelegationsList key={`delegation-list-${data.chainId}`} {...data} />
        ))}
      </ul>
    </BottomSheet>
  )
}
const DelegationsList: React.FC<{
  chainId: number
  amount: Amount
}> = (props) => {
  const { chainId, amount } = props
  const { chainId: selectedChainId } = useSelectedChainId()
  const { data: ticket } = useSelectedPrizePoolTicket()

  if (amount.amountUnformatted.isZero()) return null

  return (
    <li className='flex justify-between'>
      <div className='space-x-2 flex items-center '>
        <NetworkIcon chainId={chainId} className='' sizeClassName='w-5 h-5' />
        <span className='capitalize leading-none tracking-wider font-bold'>
          {getNetworkNiceNameByChainId(chainId)}
        </span>
      </div>
      <div className='space-x-2 flex items-center '>
        <TokenIcon chainId={selectedChainId} address={ticket.address} sizeClassName='w-5 h-5' />
        <span className='capitalize leading-none tracking-wider font-bold'>
          {amount.amountPretty}
        </span>
      </div>
    </li>
  )
}

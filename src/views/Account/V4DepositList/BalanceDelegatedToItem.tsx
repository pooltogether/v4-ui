import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { useSelectedPrizePoolTicket } from '@hooks/v4/PrizePool/useSelectedPrizePoolTicket'
import { useTotalAmountDelegatedTo } from '@hooks/v4/PrizePool/useTotalAmountDelegatedTo'
import { Amount } from '@pooltogether/hooks'
import { BottomSheet, NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { AccountListItem } from '../AccountList/AccountListItem'
import { AccountListItemTokenBalance } from '../AccountList/AccountListItemTokenBalance'

// TODO: Bottom sheet for this showing breakdown
export const BalanceDelegatedToItem: React.FC<{ usersAddress: string }> = (props) => {
  const { usersAddress } = props

  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { chainId } = useSelectedChainId()
  const { data, isFetched, isError } = useTotalAmountDelegatedTo(usersAddress)

  if (isError || !isFetched || data?.delegatedAmount.amountUnformatted.isZero()) return null

  return (
    <>
      <AccountListItem
        onClick={() => setIsOpen(true)}
        left={
          <span className='flex items-center font-bold space-x-2 text-left'>
            <span>{'🎁 '}</span>
            <span className='leading-none'>
              {t('totalDelegatedToYou', 'Total delegated to you')}
            </span>
          </span>
        }
        right={
          <AccountListItemTokenBalance chainId={chainId} token={data.totalTokenWithUsdBalance} />
        }
      />
      <BalanceDelegatedToSheet
        delegatedAmountPerChain={data.delegatedAmountPerChain}
        isOpen={isOpen}
        onDismiss={() => setIsOpen(false)}
      />
    </>
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
      <div className='mx-auto text-2xl font-bold text-inverse mb-2'>Delegations to you</div>
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
        <TokenIcon chainId={selectedChainId} address={ticket?.address} sizeClassName='w-5 h-5' />
        <span className='capitalize leading-none tracking-wider font-bold'>
          {amount.amountPretty}
        </span>
      </div>
    </li>
  )
}

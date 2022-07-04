import React, { useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import { BottomSheet, NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId, shorten } from '@pooltogether/utilities'

import { useSelectedChainId } from '@hooks/useSelectedChainId'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { usePrizePools } from '@hooks/v4/PrizePool/usePrizePools'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { PrizePool } from '@pooltogether/v4-client-js'
import { Token, usePrizePoolTokens } from '@pooltogether/hooks'
import { useSelectedPrizePoolTokens } from '@hooks/v4/PrizePool/useSelectedPrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { PrizePoolLabel } from './PrizePoolLabel'

interface SelectPrizePoolModalProps {
  className?: string
}

export const SelectPrizePoolModal = (props: SelectPrizePoolModalProps) => {
  const { className } = props

  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const prizePools = usePrizePools()
  const { chainId: selectedChainId, setSelectedChainId } = useSelectedChainId()
  const { prizePoolAddress: selectedPrizePoolAddress, setSelectedPrizePoolAddress } =
    useSelectedPrizePoolAddress()
  const selectedPrizePool = useSelectedPrizePool()

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={classNames(
          className,
          'bg-tertiary rounded-lg py-2 px-3 flex items-center space-x-2',
          'border border-transparent hover:border-highlight-1'
        )}
      >
        <PrizePoolLabel prizePool={selectedPrizePool} />
        <FeatherIcon icon='chevron-down' />
      </button>
      <BottomSheet
        open={isOpen}
        onDismiss={() => setIsOpen(false)}
        maxWidthClassName='max-w-md'
      ></BottomSheet>
    </>
  )
}

const NetworkItem = (props: {
  prizePool: PrizePool
  isSelected: boolean
  onDismiss: () => void
  setSelectedChainId: (chainId: number) => void
  setSelectedPrizePoolAddress: (address: string) => void
}) => {
  const { prizePool, isSelected, setSelectedChainId, setSelectedPrizePoolAddress, onDismiss } =
    props
  const { chainId, address } = prizePool
  const { data: tokens } = usePrizePoolTokens(prizePool)
  return (
    <li>
      <button
        onClick={() => {
          setSelectedPrizePoolAddress(address)
          setSelectedChainId(chainId)
          onDismiss()
        }}
        className={classNames(
          'bg-pt-purple-lighter dark:bg-pt-purple-darker rounded-lg p-4 flex items-center w-full transition-colors',
          'border  hover:border-highlight-1',
          {
            'border-default': isSelected,
            'border-transparent': !isSelected
          }
        )}
      >
        <PrizePoolIdentifier
          chainId={chainId}
          prizePoolAddress={prizePool.address}
          token={tokens?.token}
        />
      </button>
    </li>
  )
}

const PrizePoolIdentifier: React.FC<{ chainId: number; prizePoolAddress: string; token: Token }> = (
  props
) => {
  const { chainId, prizePoolAddress, token } = props
  return (
    <div className='flex space-x-2'>
      <NetworkIcon chainId={chainId} sizeClassName='w-5 h-5' />
      <span className='capitalize leading-none tracking-wider font-bold text-lg'>
        {getNetworkNiceNameByChainId(chainId)}
      </span>
      {!!token && (
        <>
          <TokenIcon chainId={chainId} address={token.address} />
          <span className='capitalize leading-none tracking-wider font-bold text-lg'>
            {token.symbol}
          </span>
        </>
      )}
      <span className='capitalize leading-none tracking-wider font-bold text-lg'>
        {shorten({ hash: prizePoolAddress, short: true })}
      </span>
    </div>
  )
}

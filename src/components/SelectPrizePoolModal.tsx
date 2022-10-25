import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { usePrizePools } from '@hooks/v4/PrizePool/usePrizePools'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { Token } from '@pooltogether/hooks'
import { BottomSheet, NetworkIcon, TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId, shorten } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PrizePoolLabel } from './PrizePool/PrizePoolLabel'

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
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        maxWidthClassName='xs:max-w-md'
      >
        <h6 className='text-center uppercase text-sm mb-3'>
          {t('chooseAPrizePool', 'Choose a Prize Pool')}
        </h6>
        <p className='max-w-sm mx-auto text-xs mb-12 text-center'>
          Different prize pools have different yield sources, different prizes and different ways to
          win!
        </p>

        <ul className='space-y-2 mx-auto max-w-sm'>
          {prizePools.map((prizePool) => (
            <NetworkItem
              key={prizePool.id()}
              prizePool={prizePool}
              isSelected={
                prizePool.chainId === selectedChainId &&
                prizePool.address === selectedPrizePoolAddress
              }
              closeModal={() => setIsOpen(false)}
              setSelectedChainId={setSelectedChainId}
              setSelectedPrizePoolAddress={setSelectedPrizePoolAddress}
            />
          ))}
        </ul>
      </BottomSheet>
    </>
  )
}

const NetworkItem = (props: {
  prizePool: PrizePool
  isSelected: boolean
  closeModal: () => void
  setSelectedChainId: (chainId: number) => void
  setSelectedPrizePoolAddress: (prizePool: PrizePool) => void
}) => {
  const { prizePool, isSelected, setSelectedChainId, setSelectedPrizePoolAddress, closeModal } =
    props
  const { chainId } = prizePool
  const { data: tokens } = usePrizePoolTokens(prizePool)
  return (
    <li>
      <button
        onClick={() => {
          setSelectedPrizePoolAddress(prizePool)
          setSelectedChainId(chainId)
          closeModal()
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

import React, { useState } from 'react'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'react-i18next'
import { BottomSheet, NetworkIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'

import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { useChainActiveRewards } from '@hooks/v4/TwabRewards/useChainActiveRewards'
import { useV4ChainIds } from '@hooks/v4/useV4ChainIds'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { usePrizePools } from '@hooks/v4/PrizePool/usePrizePools'
import { PrizePoolCard } from './PrizePoolCard'
import { PrizePool } from '@pooltogether/v4-client-js'
import { PrizePoolLabel, PrizePoolLabelFlat } from './PrizePoolLabel'
import { ExplorePrizePoolsModal } from '@views/Account/V4DepositList/ExplorePrizePoolsModal'

interface SelectAppChainIdModalProps {
  className?: string
}

export const SelectAppChainIdModal = (props: SelectAppChainIdModalProps) => {
  const { className } = props

  const selectedPrizePool = useSelectedPrizePool()
  const prizePools = usePrizePools()

  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const { setSelectedPrizePoolAddress } = useSelectedPrizePoolAddress()

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={classNames(
          className,
          'bg-tertiary rounded-lg py-2 px-3 flex justify-between items-center text-left',
          'border border-transparent hover:border-highlight-1'
        )}
      >
        <PrizePoolLabelFlat prizePool={selectedPrizePool} />
        {/* <div className='flex items-center space-x-1'>
          <NetworkIcon
            chainId={selectedPrizePool.chainId}
            className='mx-1'
            sizeClassName='w-5 h-5'
          />
          <span className='capitalize leading-none tracking-wider font-bold'>
            {getNetworkNiceNameByChainId(selectedPrizePool.chainId)}
          </span>
        </div> */}
        <FeatherIcon icon='chevron-down' className='' />
      </button>
      <BottomSheet open={isOpen} onDismiss={() => setIsOpen(false)} maxWidthClassName='xs:max-w-md'>
        <h6 className='text-center uppercase text-sm mb-3'>Choose a Prize Pool</h6>
        <p className='max-w-sm mx-auto text-xs mb-12 text-center'>
          Every prize pool has a different way of distributing prizes!
        </p>

        <ul className='space-y-2 mx-auto'>
          {prizePools.map((prizePool) => {
            const isSelected = prizePool.id() === selectedPrizePool.id()
            return (
              <button
                onClick={() => {
                  setIsOpen(false)
                  setSelectedPrizePoolAddress(prizePool)
                }}
                className={classNames('rounded-lg p-2 w-full border', {
                  'border-transparent hover:border-pt-teal': !isSelected,
                  'border-pt-purple-light hover:border-pt-teal': isSelected
                })}
              >
                <PrizePoolLabelFlat prizePool={prizePool} />
              </button>
            )
          })}
        </ul>
      </BottomSheet>
    </>
  )
}

const NetworkItem = (props: {
  chainId: number
  isSelected: boolean
  onDismiss: () => void
  setSelectedChainId: (chainId: number) => void
}) => {
  const { chainId, isSelected, setSelectedChainId, onDismiss } = props

  const { data: activeChainRewards } = useChainActiveRewards()

  let hasActiveRewards
  if (activeChainRewards?.chains?.[chainId] > 0) {
    hasActiveRewards = true
  }

  return (
    <li>
      <button
        onClick={() => {
          setSelectedChainId(chainId)
          onDismiss()
        }}
        className={classNames(
          'bg-pt-purple-lighter dark:bg-pt-purple-darker rounded-lg px-4 p-2 flex items-center justify-between w-full transition-colors',
          'border hover:border-highlight-1',
          {
            'border-default': isSelected,
            'border-transparent': !isSelected
          }
        )}
        style={{ minHeight: 54 }}
      >
        <NetworkLabel chainId={chainId} />
        <RewardsLabel hasActiveRewards={hasActiveRewards} />
      </button>
    </li>
  )
}

const NetworkLabel = (props) => {
  const { chainId } = props

  return (
    <div className='flex items-center'>
      <NetworkIcon chainId={chainId} className='mx-1' sizeClassName='w-5 h-5 mr-2' />
      <span className='capitalize leading-none tracking-wider font-bold text-lg'>
        {getNetworkNiceNameByChainId(chainId)}
      </span>
    </div>
  )
}

const RewardsLabel = (props) => {
  const { t } = useTranslation()

  if (!props.hasActiveRewards) {
    return null
  }

  return (
    <div className='flex items-center uppercase text-xxs font-averta-bold bg-pt-teal dark:bg-pt-teal px-3 py-1 bg-flashy rounded-full text-pt-purple-dark'>
      <img className='w-4 mr-2 inline-block' src='beach-with-umbrella.png' /> {t('rewards')}!
    </div>
  )
}

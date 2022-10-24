import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { usePrizePools } from '@hooks/v4/PrizePool/usePrizePools'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { useChainActiveRewards } from '@hooks/v4/TwabRewards/useChainActiveRewards'
import { BottomSheet, NetworkIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { PrizePoolLabelFlat } from './PrizePool/PrizePoolLabel'
import { MinimumDeposit } from './PrizePoolNetwork/MinimumDeposit'

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
          'bg-tertiary rounded-lg py-2 px-4 flex justify-between items-center text-left',
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
      <BottomSheet
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        maxWidthClassName='xs:max-w-md'
      >
        <h6 className='text-center uppercase text-sm mb-3'>Choose a Prize Pool</h6>
        <p className='max-w-sm mx-auto text-xs mb-12 text-center'>
          Every prize pool has a different way of distributing prizes! Every <MinimumDeposit /> has
          an equal chance to win the Grand Prize.
        </p>

        <ul className='space-y-2 mx-auto'>
          {prizePools.map((prizePool) => {
            const isSelected = prizePool.id() === selectedPrizePool.id()
            return (
              <button
                key={prizePool.id()}
                onClick={async () => {
                  setSelectedPrizePoolAddress(prizePool)
                  setIsOpen(false)
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
  closeModal: () => void
  setSelectedChainId: (chainId: number) => void
}) => {
  const { chainId, isSelected, setSelectedChainId, closeModal } = props

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
          closeModal()
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
    <div className='flex items-center uppercase text-xxs font-bold bg-pt-teal dark:bg-pt-teal px-3 py-1 bg-flashy rounded-full text-pt-purple-dark'>
      <img className='w-4 h-4 mr-2 inline-block' src='/beach-with-umbrella.png' /> {t('rewards')}!
    </div>
  )
}

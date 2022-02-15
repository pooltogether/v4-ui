import React, { useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import { NetworkIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'

import { useSelectedChainId } from '@src/hooks/useSelectedChainId'
import { BottomSheet } from './BottomSheet'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { useV4ChainIds } from '@src/hooks/useV4ChainIds'

interface SelectAppChainIdModalProps {
  className?: string
}

export const SelectAppChainIdModal = (props: SelectAppChainIdModalProps) => {
  const { className } = props

  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const supportedChainIds = useV4ChainIds()
  const { chainId: selectedChainId, setSelectedChainId } = useSelectedChainId()

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={classNames(
          className,
          'bg-tertiary rounded-lg py-2 px-3 flex items-center',
          'border border-transparent hover:border-highlight-1'
        )}
      >
        <NetworkIcon chainId={selectedChainId} className='mx-1' sizeClassName='w-5 h-5' />
        <span className='capitalize leading-none tracking-wider font-bold'>
          {getNetworkNiceNameByChainId(selectedChainId)}
        </span>
        <FeatherIcon icon='chevron-down' className='ml-2' />
      </button>
      <BottomSheet open={isOpen} onDismiss={() => setIsOpen(false)} maxWidthClassName='max-w-md'>
        <h6 className='text-center uppercase text-sm mb-3'>{t('chooseANetwork')}</h6>
        <p className='max-w-xs mx-auto text-xs mb-12 text-center'>{t('v4NetworkSelectPrompt')}</p>

        <ul className='space-y-2 mx-auto max-w-sm'>
          {supportedChainIds.map((chainId) => (
            <NetworkItem
              key={chainId}
              chainId={chainId}
              isSelected={chainId === selectedChainId}
              onDismiss={() => setIsOpen(false)}
              setSelectedChainId={setSelectedChainId}
            />
          ))}
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
  return (
    <li>
      <button
        onClick={() => {
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
        <NetworkIcon chainId={chainId} className='mx-1' sizeClassName='w-5 h-5 mr-2' />
        <span className='capitalize leading-none tracking-wider font-bold text-lg'>
          {getNetworkNiceNameByChainId(chainId)}
        </span>
      </button>
    </li>
  )
}

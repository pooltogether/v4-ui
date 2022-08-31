import React, { useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'react-i18next'
import { SwapTokensModal } from '@components/Modal/SwapTokensModal'
import { PrizePool } from '@pooltogether/v4-client-js'
import { BridgeTokensModal } from '@components/Modal/BridgeTokensModal'
import { BuyTokensModal } from '@components/Modal/BuyTokensModal'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'

export const Footer = () => {
  const prizePool = useSelectedPrizePool()
  const { data: prizePoolTokens } = usePrizePoolTokens(prizePool)

  return (
    <div className='w-full flex justify-around sm:justify-between py-4 max-w-xl mx-auto mb-20 xs:mb-4 md:mb-8 lg:mb-12'>
      <BuyTokensModalTrigger chainId={prizePool.chainId} />
      <BridgeTokensModalTrigger prizePool={prizePool} />
      <SwapTokensModalTrigger
        chainId={prizePool.chainId}
        outputCurrencyAddress={prizePoolTokens?.token.address}
      />
      <HelpLink />
    </div>
  )
}

const HelpLink = () => {
  const { t } = useTranslation()

  return (
    <a
      href='https://docs.pooltogether.com/welcome/getting-started'
      target='_blank'
      rel='noreferrer noopener'
      className='text-center text-xxxs xs:text-xs text-inverse opacity-60 hover:opacity-100 transition-opacity xs:-ml-3 flex flex-col items-center xs:flex-row xs:space-x-1 sm:space-x-2 space-y-1 xs:space-y-0 justify-between xs:justify-center'
    >
      <FeatherIcon icon={'help-circle'} className='relative w-4 h-4 inline-block' />
      <span>{t('help', 'Help')}</span>
    </a>
  )
}

const SwapTokensModalTrigger: React.FC<{
  buttonLabel?: string
  chainId?: number
  outputCurrencyAddress?: string
  className?: string
}> = (props) => {
  const { buttonLabel, chainId, outputCurrencyAddress, className } = props
  const [showModal, setShowModal] = useState(false)

  const { t } = useTranslation()

  return (
    <>
      <ModalTrigger
        onClick={() => setShowModal(true)}
        label={t('swapTokens', 'Swap tokens')}
        icon={<FeatherIcon icon={'refresh-cw'} className='relative w-4 h-4' />}
      />
      <SwapTokensModal
        label={t('decentralizedExchangeModal', 'Decentralized exchange - modal')}
        chainId={chainId}
        tokenAddress={outputCurrencyAddress}
        isOpen={showModal}
        closeModal={() => setShowModal(false)}
      />
    </>
  )
}

const BridgeTokensModalTrigger: React.FC<{ prizePool: PrizePool }> = (props) => {
  const { prizePool } = props
  const [showModal, setShowModal] = useState(false)

  const { t } = useTranslation()

  return (
    <>
      <ModalTrigger
        onClick={() => setShowModal(true)}
        label={t('bridgeTokens', 'Bridge tokens')}
        icon={
          <div className='flex -space-x-1'>
            <FeatherIcon icon={'arrow-left'} className='relative w-3 h-3' />
            <FeatherIcon icon={'arrow-right'} className='relative w-3 h-3' />
          </div>
        }
      />
      <BridgeTokensModal
        label={t('ethToL2BridgeModal', 'Ethereum to L2 bridge - modal')}
        chainId={prizePool.chainId}
        isOpen={showModal}
        closeModal={() => setShowModal(false)}
      />
    </>
  )
}

const BuyTokensModalTrigger: React.FC<{ chainId: number }> = (props) => {
  const [showModal, setShowModal] = useState(false)

  const { t } = useTranslation()

  return (
    <>
      <ModalTrigger
        onClick={() => setShowModal(true)}
        label={t('buyTokens', 'Buy tokens')}
        icon={<FeatherIcon icon={'dollar-sign'} className='relative w-4 h-4' />}
      />
      <BuyTokensModal
        chainId={props.chainId}
        label={'Buy tokens - modal'}
        isOpen={showModal}
        closeModal={() => setShowModal(false)}
      />
    </>
  )
}

const ModalTrigger: React.FC<{
  onClick: () => void
  icon: React.ReactNode
  label: React.ReactNode
}> = (props) => (
  <button
    className='text-xxxs xs:text-xs text-center text-inverse opacity-50 hover:opacity-100 transition-opacity flex flex-col space-y-1 justify-center items-center xs:flex-row xs:space-y-0 xs:space-x-1 sm:space-x-2'
    onClick={props.onClick}
  >
    {props.icon}
    <span>{props.label}</span>
  </button>
)

import React, { useState } from 'react'
import {
  Account,
  LanguagePickerDropdown,
  NetworkSelector,
  PageHeaderContainer,
  SettingsContainer,
  SettingsItem,
  TestnetSettingsItem,
  ThemeSettingsItem
} from '@pooltogether/react-components'
import FeatherIcon from 'feather-icons-react'
import { PrizePool } from '@pooltogether/v4-js-client'
import { BridgeTokensModal } from 'lib/components/Modal/BridgeTokensModal'
import { usePrizePoolBySelectedNetwork } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolBySelectedNetwork'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { useRouter } from 'next/router'

import { Navigation } from 'lib/components/Navigation'
import { useSupportedNetworks } from 'lib/hooks/useSupportedNetworks'

export enum ContentPaneState {
  deposit = 'deposit',
  prizes = 'prizes',
  account = 'account'
}

export const PageHeader = (props) => {
  const router = useRouter()

  return (
    <PageHeaderContainer
      Link={Link}
      as='/deposit'
      href='/deposit'
      className='z-20 sticky top-0 bg-page-header'
    >
      <Navigation />
      <UsersAccount />
      <Settings />
    </PageHeaderContainer>
  )
}

const Settings = () => {
  const { t } = useTranslation()
  const prizePool = usePrizePoolBySelectedNetwork()

  return (
    <SettingsContainer t={t} className='ml-1 my-auto' title='Settings' sizeClassName='w-6 h-6'>
      <LanguagePicker />
      <ThemeSettingsItem t={t} />
      <BridgeTokensModalTrigger prizePool={prizePool} />
      <TestnetSettingsItem t={t} />
    </SettingsContainer>
  )
}

const BUTTON_MIN_WIDTH = 100
interface ExternalLinkProps {
  prizePool: PrizePool
}
const BridgeTokensModalTrigger = (props: ExternalLinkProps) => {
  const { prizePool } = props
  const [showModal, setShowModal] = useState(false)

  const { t } = useTranslation()

  return (
    <>
      <SettingsItem label={t('Bridge')}>
        <button
          className='text-center text-inverse opacity-100 hover:opacity-80 transition-opacity'
          onClick={() => setShowModal(true)}
          style={{ minWidth: BUTTON_MIN_WIDTH }}
        >
          {t('bridgeTokens', 'Bridge tokens')}
        </button>
        <BridgeTokensModal
          label={t('ethToL2BridgeModal', 'Ethereum to L2 bridge - modal')}
          chainId={prizePool.chainId}
          isOpen={showModal}
          closeModal={() => setShowModal(false)}
        />
      </SettingsItem>
    </>
  )
}


const LanguagePicker = () => {
  const { i18n: i18next, t } = useTranslation()
  const [currentLang, setCurrentLang] = useState(i18next.language)
  return (
    <SettingsItem label={t('language')}>
      <LanguagePickerDropdown
        className='text-white'
        currentLang={currentLang}
        changeLang={(newLang) => {
          setCurrentLang(newLang)
          i18next.changeLanguage(newLang)
        }}
      />
    </SettingsItem>
  )
}

const UsersAccount = () => {
  const {
    isWalletConnected,
    provider,
    connectWallet,
    disconnectWallet,
    walletName,
    isOnboardReady,
    address: usersAddress,
    network: chainId,
    wallet,
    network
  } = useOnboard()

  const supportedNetworks = useSupportedNetworks()
  const { t } = useTranslation()

  if (!isOnboardReady) return null

  return (
    <>
      <NetworkSelector
        supportedNetworks={supportedNetworks}
        className='mx-1 my-auto'
        t={t}
        network={network}
        wallet={wallet}
        chainId={chainId}
        isWalletConnected={isWalletConnected}
      />
      <Account
        t={t}
        className='mx-1 my-auto'
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        isWalletConnected={isWalletConnected}
        provider={provider}
        chainId={chainId}
        usersAddress={usersAddress}
        walletName={walletName}
      />
    </>
  )
}

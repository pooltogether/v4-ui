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
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'

import { Navigation } from 'lib/components/Navigation'
import { useSupportedNetworks } from 'lib/hooks/useSupportedNetworks'

export enum ContentPaneState {
  deposit = 'deposit',
  prizes = 'prizes',
  account = 'account'
}

export const PageHeader = (props) => (
  <PageHeaderContainer Link={Link} as='/' href='/' className='z-20 sticky top-0 bg-body'>
    <Navigation />
    <UsersAccount />
    <Settings />
  </PageHeaderContainer>
)

const Settings = () => {
  const { t } = useTranslation()

  return (
    <SettingsContainer t={t} className='ml-1 my-auto' title='Settings' sizeClassName='w-6 h-6'>
      <LanguagePicker />
      <ThemeSettingsItem t={t} />
      <TestnetSettingsItem t={t} />
    </SettingsContainer>
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

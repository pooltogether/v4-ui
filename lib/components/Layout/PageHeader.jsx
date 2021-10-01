import React, { useState } from 'react'
import {
  Account,
  Button,
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

import { useSupportedNetworks } from 'lib/hooks/useSupportedNetworks'

export const PageHeader = (props) => (
  <PageHeaderContainer Link={Link} as='/' href='/'>
    <UsersAccount />
    <Settings />
  </PageHeaderContainer>
)

const Settings = () => {
  const { t } = useTranslation()
  return (
    <SettingsContainer t={t} className='ml-1 my-auto' title='Settings'>
      <LanguagePicker />
      <ThemeSettingsItem t={t} />
      <TestnetSettingsItem t={t} />
    </SettingsContainer>
  )
}

const LanguagePicker = () => {
  const { i18n: i18next } = useTranslation()
  const [currentLang, setCurrentLang] = useState(i18next.language)
  return (
    <SettingsItem label='Language'>
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
    connectWallet,
    isOnboardReady,
    disconnectWallet,
    provider,
    address,
    walletName,
    network
  } = useOnboard()
  const supportedNetworks = useSupportedNetworks()
  const { t } = useTranslation()

  if (!isOnboardReady) return null

  if (!isWalletConnected) {
    return (
      <Button
        padding='px-4 sm:px-6 py-1'
        onClick={() => connectWallet()}
        textSize='xxxs'
        className='mx-1 my-auto'
      >
        {t('connectWallet')}
      </Button>
    )
  }

  return (
    <>
      <NetworkSelector supportedNetworks={supportedNetworks} className='mx-1 my-auto' />
      <Account
        className='mx-1 my-auto'
        t={t}
        isWalletConnected={isWalletConnected}
        disconnectWallet={disconnectWallet}
        provider={provider}
        chainId={network}
        usersAddress={address}
        connectWallet={connectWallet}
        walletName={walletName}
      />
    </>
  )
}

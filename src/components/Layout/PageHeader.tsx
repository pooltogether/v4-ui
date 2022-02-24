import React, { useState } from 'react'
import {
  Account,
  LanguagePickerDropdown,
  NetworkSelector,
  PageHeaderContainer,
  SettingsContainer,
  SettingsItem,
  TestnetSettingsItem,
  FeatureRequestSettingsItem,
  ThemeSettingsItem,
  SocialLinks
} from '@pooltogether/react-components'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'

import { TopNavigation } from '@components/Layout/Navigation'
import { useSupportedChainIds } from '@hooks/useSupportedChainIds'

export enum ContentPaneState {
  deposit = 'deposit',
  prizes = 'prizes',
  account = 'account'
}

export const PageHeader = (props) => {
  return (
    <PageHeaderContainer
      Link={Link}
      as='https://pooltogether.com'
      href='https://pooltogether.com'
      className='sticky top-0 bg-page-header'
      style={{ zIndex: 3 }}
    >
      <TopNavigation className='absolute mx-auto inset-x-0' />
      <div className='flex flex-row justify-end items-center'>
        <UsersAccount />
        <Settings />
      </div>
    </PageHeaderContainer>
  )
}

const Settings = () => {
  const { t } = useTranslation()

  return (
    <SettingsContainer t={t} className='ml-1 my-auto' sizeClassName='w-6 h-6 overflow-hidden'>
      <div className='flex flex-col justify-between h-full sm:h-auto'>
        <div>
          <LanguagePicker />
          <ThemeSettingsItem t={t} />
          <TestnetSettingsItem t={t} />
          <FeatureRequestSettingsItem t={t} />
          <ClearLocalStorageSettingsItem />
        </div>
        <div className='sm:pt-24 pb-4 sm:pb-0'>
          <SocialLinks t={t} />
        </div>
      </div>
    </SettingsContainer>
  )
}

const LanguagePicker = () => {
  const { i18n: i18next, t } = useTranslation()
  const [currentLang, setCurrentLang] = useState(i18next.language)
  return (
    <SettingsItem label={t('language')}>
      <LanguagePickerDropdown
        className='dark:text-white'
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

  const supportedNetworks = useSupportedChainIds()
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

const ClearLocalStorageSettingsItem = () => {
  const { t } = useTranslation()
  return (
    <SettingsItem label={t('clearStorage', 'Clear storage')}>
      <button
        className='font-semibold text-pt-red-light transition-colors hover:text-pt-red'
        onClick={() => {
          if (
            window.confirm(
              t(
                'clearingStorageWarning',
                'Continuing will clear the websites storage in your browser. This DOES NOT have any effect on your deposits.'
              )
            )
          ) {
            localStorage.clear()
            window.location.reload()
          }
        }}
      >
        {t('clear', 'Clear')}
      </button>
    </SettingsItem>
  )
}

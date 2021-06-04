import React, { useState } from 'react'
import {
  Button,
  LanguagePickerDropdown,
  PageHeaderContainer,
  SettingsContainer,
  TestnetToggle,
  ThemeToggle
} from '@pooltogether/react-components'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

import { NavPoolBalance } from 'lib/components/Layout/NavPoolBalance'
import { NetworkText } from 'lib/components/Layout/NetworkText'
import { useOnboard } from '@pooltogether/hooks'

export const PageHeader = (props) => (
  <PageHeaderContainer Link={Link} as='/' href='/'>
    <UsersAccount />
    <LanguagePicker />
    <Settings />
  </PageHeaderContainer>
)

const Settings = () => (
  <SettingsContainer>
    <ThemeToggle />
    <TestnetToggle />
  </SettingsContainer>
)

const LanguagePicker = () => {
  const { i18n: i18next } = useTranslation()
  const [currentLang, setCurrentLang] = useState(i18next.language)
  return (
    <LanguagePickerDropdown
      currentLang={currentLang}
      changeLang={(newLang) => {
        setCurrentLang(newLang)
        i18next.changeLanguage(newLang)
      }}
    />
  )
}

const UsersAccount = () => {
  const { isWalletConnected, connectWallet, isOnboardReady } = useOnboard()

  if (!isOnboardReady) return null

  if (!isWalletConnected) {
    return (
      <Button padding='px-4 sm:px-6 py-1' onClick={() => connectWallet()} textSize='xxxs'>
        Connect wallet
      </Button>
    )
  }

  return (
    <>
      <NetworkText />
      <NavPoolBalance />
    </>
  )
}

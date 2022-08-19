import FeatherIcon from 'feather-icons-react'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  LanguagePickerDropdown,
  PageHeaderContainer,
  SettingsContainer,
  SettingsItem,
  TestnetSettingsItem,
  FeatureRequestSettingsItem,
  ThemeSettingsItem,
  SocialLinks,
  Modal,
  NetworkIcon
} from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'

import { TopNavigation } from '@components/Layout/Navigation'
import { CHAIN_IDS_TO_BLOCK } from '@constants/config'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { SUPPORTED_LANGUAGES } from '@constants/languages'
import { FullWalletConnectionButtonWrapper } from './FullWalletConnectionButtonWrapper'
import UnstoppableBotton from './UnstoppableBotton'
import UAuth from '@uauth/js'

const uauth = new UAuth(
  {
    clientID: "da07b4f5-d452-4a95-b798-298776d04d6d",
    redirectUri: "https://pooltogether-v4-ui.vercel.app/deposit",
    scope: "openid wallet"
  }
)

export enum ContentPaneState {
  deposit = 'deposit',
  prizes = 'prizes',
  account = 'account'
}

export const PageHeader = (props) => {
    const [userWallet, setUserWallet] = useState<string>('')

          //useEffect model
  useEffect(() => {
    // setUserWallet("Login With Unstoppable")
    uauth
      .user()
      .then((user) => {
        setUserWallet(user.sub)
        // user exists
        console.log('User information:', user)
      })
      .catch((err) => {
        console.log(err)
        // user does not exist
      })
  }, [])

    //login button
  const login = async () => {
    try {
      const authorization = await uauth.loginWithPopup()
      uauth.user().then((user) => {
        setUserWallet(user.sub)
        // user exist
        console.log('User information:', user)
      })
      console.log(authorization)
    } catch (err) {
      console.error(err)
    }
  }

  const logout = async () => {
    try {
      await uauth.logout()
      setUserWallet('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <PageHeaderContainer Link={Link} as='/deposit' href='/deposit'>
      <TopNavigation className='absolute mx-auto inset-x-0' />
      <div className='flex flex-row justify-end items-center space-x-4'>
        <NetworkWarning />
        <FullWalletConnectionButtonWrapper />
        <UnstoppableBotton
          onClick={login}
          width='150px'
          children='Login With Unstoppable'
        />
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
        langs={SUPPORTED_LANGUAGES}
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

const NetworkWarning = () => {
  const [isOpen, setIsOpen] = useState(true)
  const chainIds = CHAIN_IDS_TO_BLOCK
  const { t } = useTranslation()

  if (chainIds.length === 0) return null

  return (
    <>
      <button onClick={() => setIsOpen(true)} className='mr-1'>
        <FeatherIcon icon='alert-triangle' className='text-pt-red-light w-6 h-6' />
      </button>
      <Modal
        label='network-warning-modal'
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        className='border-2 border-pt-red-light flex flex-col text-center rounded bg-darkened py-8 px-4 space-y-4'
      >
        <FeatherIcon icon='alert-triangle' className='text-pt-red-light w-12 h-12 mx-auto' />
        <p className='text-lg font-bold'>
          {t(
            'issuesContactingBlockchain',
            `We're having issues contacting one or more blockchains.`
          )}
        </p>
        <p className='opacity-70'>
          {t(
            'followingChainsHaveDegradedService',
            'The following networks will have degraded service in app:'
          )}
        </p>
        {CHAIN_IDS_TO_BLOCK.map((chainId) => (
          <div className='flex space-x-2 items-center mx-auto w-full justify-center'>
            <NetworkIcon chainId={chainId} sizeClassName='w-6 h-6' />
            <span className='text-lg font-bold'>{getNetworkNiceNameByChainId(chainId)}</span>
          </div>
        ))}
      </Modal>
    </>
  )
}

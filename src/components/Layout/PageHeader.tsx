import { CHAIN_IDS_TO_BLOCK } from '@constants/config'
import { SUPPORTED_CURRENCIES } from '@constants/currencies'
import { SUPPORTED_LANGUAGES } from '@constants/languages'
import { useSelectedCurrency } from '@hooks/useSelectedCurrency'
import {
  LanguagePickerDropdown,
  SettingsItem,
  Modal,
  NetworkIcon,
  HeaderLogo,
  PageHeaderContainer,
  SettingsModal
} from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import {
  NetworkSelectionCurrentlySelected,
  NetworkSelectionList,
  useWalletChainId
} from '@pooltogether/wallet-connection'
import { getSupportedChains } from '@utils/getSupportedChains'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { FullWalletConnectionButtonWrapper } from './FullWalletConnectionButtonWrapper'

export const NEGATIVE_HEADER_MARGIN = '-mt-12 sm:-mt-16'

export const PageHeader = (props) => (
  <PageHeaderContainer
    maxWidthClassName='max-w-screen-md'
    logo={
      <Link href='/deposit'>
        <a>
          <HeaderLogo />
        </a>
      </Link>
    }
  >
    <div className='flex flex-row justify-end items-center space-x-4'>
      <NetworkWarning />
      <FullWalletConnectionButtonWrapper />
      <Settings />
    </div>
  </PageHeaderContainer>
)

const Settings = () => {
  const { t, i18n: i18next } = useTranslation()
  const { currency, setCurrency } = useSelectedCurrency()
  const [isOpen, setIsOpen] = useState(false)
  const chains = getSupportedChains()
  const walletChainId = useWalletChainId()
  const [currentLang, setCurrentLang] = useState(i18next.language)
  const router = useRouter()

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        <FeatherIcon
          icon='menu'
          className={classNames('w-6 h-6 text-gradient-magenta hover:text-inverse transition')}
        />
      </button>
      <SettingsModal
        t={t}
        isOpen={isOpen}
        walletChainId={walletChainId}
        closeModal={() => setIsOpen(false)}
        networkView={() => <NetworkView />}
        langs={SUPPORTED_LANGUAGES}
        currentLang={currentLang}
        changeLang={(newLang) => {
          setCurrentLang(newLang)
          i18next.changeLanguage(newLang)
          router.push({ pathname: router.pathname, query: router.query }, router.asPath, {
            locale: newLang
          })
        }}
        currencies={SUPPORTED_CURRENCIES}
        currentCurrency={currency}
        changeCurrency={setCurrency}
      />
    </>
  )
}

const NetworkView = () => {
  const chains = getSupportedChains()
  const { t } = useTranslation()
  return (
    <>
      <p className='mb-3 text-center'>
        Selecting a network will prompt you to switch to the network selected in your wallet.
      </p>
      <NetworkSelectionList chains={chains} />
      <NetworkSelectionCurrentlySelected t={t} />
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
          <div
            key={`chain-to-block-${chainId}`}
            className='flex space-x-2 items-center mx-auto w-full justify-center'
          >
            <NetworkIcon chainId={chainId} sizeClassName='w-6 h-6' />
            <span className='text-lg font-bold'>{getNetworkNiceNameByChainId(chainId)}</span>
          </div>
        ))}
      </Modal>
    </>
  )
}

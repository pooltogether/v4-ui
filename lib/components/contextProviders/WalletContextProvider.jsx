import React, { useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { ethers } from 'ethers'

import { COOKIE_OPTIONS, SELECTED_WALLET_COOKIE_KEY } from 'lib/constants'
import { MagicContext } from 'lib/components/contextProviders/MagicContextProvider'

const debug = require('debug')('WalletContextProvider')

let provider

export const WalletContext = React.createContext(null)

export function WalletContextProvider(props) {
  const { children, postConnectCallback } = props

  const [address, setAddress] = useState(null)
  const [network, setNetwork] = useState(null)
  const [balance, setBalance] = useState(null)
  const [wallet, setWallet] = useState({})

  const [onboard, setOnboard] = useState(null)

  const { magic } = useContext(MagicContext)

  const disconnectWallet = () => {
    if (onboard) {
      onboard.walletReset()
    } else {
      console.log('no onboard?')
    }

    Cookies.remove(SELECTED_WALLET_COOKIE_KEY, COOKIE_OPTIONS)
  }

  const getOnboard = async () => {
    if (onboard) {
      return onboard
    }

    const initOnboardModule = await import('lib/services/initOnboard')

    return initOnboardModule.initOnboard({
      address: setAddress,
      network: setNetwork,
      balance: setBalance,
      wallet: (wallet) => {
        if (wallet.provider) {
          // if (magic) {
          //   magicContext.signOut()
          // }

          setWallet(wallet)

          Cookies.set(SELECTED_WALLET_COOKIE_KEY, wallet.name, COOKIE_OPTIONS)

          provider = new ethers.providers.Web3Provider(wallet.provider, 'any')

          // postConnectCallback()
        } else {
          provider = null
          setWallet({})

          Cookies.remove(SELECTED_WALLET_COOKIE_KEY, COOKIE_OPTIONS)
        }
      }
    })
  }

  const handleLoadOnboard = async () => {
    const ob = await getOnboard()
    setOnboard(ob)
  }

  useEffect(() => {
    const hasWalletCookie = Cookies.get(SELECTED_WALLET_COOKIE_KEY)

    if (hasWalletCookie) {
      // console.log('handleLoadOnboard from cookie')
      handleLoadOnboard()
    }
  }, [])

  const connectWallet = async (postSignInCallback) => {
    let _onboard = onboard

    if (!_onboard) {
      console.warn(`onboard wasn't ready when user clicked "connect wallet"! (this is slow)`)

      await handleLoadOnboard()
      _onboard = await getOnboard()
    }

    const walletSelected = await _onboard.walletSelect()
    if (!walletSelected) {
      return
    }

    await _onboard.walletCheck()

    const address = _onboard.getState().address

    if (postSignInCallback && address) {
      postSignInCallback()
    }
  }

  const reconnectWallet = (previouslySelectedWallet) => {
    onboard.walletReset()

    if (previouslySelectedWallet && onboard) {
      onboard.walletSelect(previouslySelectedWallet)
    }
  }

  return (
    <WalletContext.Provider
      value={{
        onboard,
        onboardAddress: address,
        onboardBalance: balance,
        onboardNetwork: network,
        onboardProvider: provider,
        onboardWallet: wallet,
        connectWallet,
        disconnectWallet,
        reconnectWallet,
        walletCheck: onboard?.walletCheck,
        handleLoadOnboard
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

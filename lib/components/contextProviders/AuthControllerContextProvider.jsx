import React, { useEffect, useState, useContext } from 'react'
import Cookies from 'js-cookie'
import { useRouter } from 'next/router'
import { useQueryCache } from 'react-query'

import {
  COOKIE_OPTIONS,
  SUPPORTED_CHAIN_IDS,
  SELECTED_WALLET_COOKIE_KEY,
  MAGIC_EMAIL
} from 'lib/constants'
import { MagicContext } from 'lib/components/contextProviders/MagicContextProvider'
import { WalletContext } from 'lib/components/contextProviders/WalletContextProvider'
import { chainIdToNetworkName } from 'lib/utils/chainIdToNetworkName'
import { getChainId } from 'lib/utils/getChainId'
import { queryParamUpdater } from 'lib/utils/queryParamUpdater'

const debug = require('debug')('AuthControllerContextProvider')

export const AuthControllerContext = React.createContext(null)

// This AuthController allows us to have one place to interface with both the Magic context and
// the Onboardjs/Wallet context - this provides us with more control of what happens to
// both when one is signed in / signed out of and avoids circular dependencies
//
// This also provides a unified authentication pattern to get the usersAddress
// and ethers provider for transactions
export function AuthControllerContextProvider(props) {
  const { children } = props

  const router = useRouter()
  const queryCache = useQueryCache()

  const [changingNetwork, setChangingNetwork] = useState(false)

  const {
    onboard,
    onboardAddress,
    onboardBalance,
    onboardNetwork,
    onboardProvider,
    onboardWallet,
    reconnectWallet,
    connectWallet,
    disconnectWallet
  } = useContext(WalletContext)

  const { address, magic, signIn, signedIn, signOut: magicSignOut } = useContext(MagicContext)

  const ethBalance = onboardBalance || null

  let walletName = 'Unknown'
  if (magic && signedIn) {
    walletName = 'Magic'
  } else if (onboardWallet) {
    walletName = onboardWallet.name
  }

  const defaultChainId = getChainId(process.env.NEXT_JS_DEFAULT_ETHEREUM_NETWORK_NAME)
  const [chainId, setChainId] = useState(defaultChainId)
  const [provider, setProvider] = useState()
  const [usersAddress, setUsersAddress] = useState()
  const [magicAutoSignInAlreadyExecuted, setMagicAutoSignInAlreadyExecuted] = useState(false)

  useEffect(() => {
    setProvider(onboardProvider)
  }, [onboardProvider, signedIn])

  useEffect(() => {
    const updateChainId = async () => {
      if (onboardNetwork && onboardNetwork !== chainId) {
        queryCache.clear()
        setChangingNetwork(true)

        setChainId(onboardNetwork)

        setTimeout(() => {
          setChangingNetwork(false)
        }, 200)
      }
    }

    updateChainId()
  }, [onboardNetwork])

  useEffect(() => {
    let usersAddress

    if (onboardAddress) {
      usersAddress = onboardAddress
    }

    if (!usersAddress && address) {
      usersAddress = address
    }

    setUsersAddress(usersAddress?.toLowerCase())
  }, [address, onboardAddress])

  const postDisconnectRedirect = () => {}

  const signOut = async (e) => {
    if (e) {
      e.preventDefault()
    }

    // magicSignOut()
    disconnectWallet()

    postDisconnectRedirect()
  }

  const signInMagic = async (formEmail, postSignInCallback) => {
    signIn(formEmail, postSignInCallback)
    disconnectWallet()
  }

  useEffect(() => {
    if (magic) {
      const emailFromCookies = Cookies.get(MAGIC_EMAIL)

      const autoSignInMagic = async () => {
        if (await magic.user.isLoggedIn()) {
          signInMagic(emailFromCookies)
        }
      }

      if (emailFromCookies && !magicAutoSignInAlreadyExecuted) {
        autoSignInMagic()
      }

      setMagicAutoSignInAlreadyExecuted(true)
    }
  }, [magic])

  useEffect(() => {
    if (onboard) {
      debug('inside onboard UseEffect if!')
      const autoSignInWallet = async () => {
        const previouslySelectedWallet = Cookies.get(SELECTED_WALLET_COOKIE_KEY)

        if (previouslySelectedWallet !== undefined) {
          debug('running autosign in!')
          reconnectWallet(previouslySelectedWallet)
        }
      }

      autoSignInWallet()
    }
  }, [onboard])

  const networkName = chainIdToNetworkName(chainId)
  const supportedNetwork = SUPPORTED_CHAIN_IDS.includes(chainId)

  const pauseQueries = !supportedNetwork || changingNetwork

  return (
    <AuthControllerContext.Provider
      value={{
        changingNetwork,
        ethBalance,
        chainId,
        pauseQueries,
        provider,
        usersAddress,
        walletName,
        signOut,
        signInMagic,
        connectWallet,
        networkName,
        supportedNetwork
      }}
    >
      {children}
    </AuthControllerContext.Provider>
  )
}

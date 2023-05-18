import { connectorsForWallets, Wallet } from '@rainbow-me/rainbowkit'
import {
  injectedWallet,
  rainbowWallet,
  walletConnectWallet,
  argentWallet,
  coinbaseWallet,
  ledgerWallet,
  metaMaskWallet,
  tahoWallet,
  trustWallet,
  zerionWallet
} from '@rainbow-me/rainbowkit/wallets'
import { Connector, Chain } from 'wagmi'
import { parseQueryParam } from '../parseQueryParam'

const HIGHLIGHTED_WALLET_KEY = 'wallet'

const WALLETS = Object.freeze({
  metamask: metaMaskWallet,
  walletconnect: walletConnectWallet,
  rainbow: rainbowWallet,
  injected: injectedWallet,
  argent: argentWallet,
  coinbase: coinbaseWallet,
  ledger: ledgerWallet,
  taho: tahoWallet,
  trust: trustWallet,
  zerion: zerionWallet
})

export const getWalletConnectors = (chains: Chain[]): (() => Connector[]) => {
  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
  const appName = 'PoolTogether'
  const walletGroups: {
    groupName: string
    wallets: Wallet[]
  }[] = []

  const defaultWallets = ['metamask', 'walletconnect', 'rainbow', 'injected', 'coinbase']
  const moreWallets = ['argent', 'ledger', 'taho', 'trust', 'zerion']

  const highlightedWallet = parseQueryParam(HIGHLIGHTED_WALLET_KEY, {
    validValues: Object.keys(WALLETS)
  })

  if (!!highlightedWallet) {
    walletGroups.push({
      groupName: 'Recommended',
      wallets: [WALLETS[highlightedWallet]({ appName, chains, projectId })]
    })
    walletGroups.push({
      groupName: 'Default',
      wallets: defaultWallets
        .filter((wallet) => highlightedWallet !== wallet)
        .map((wallet) => WALLETS[wallet]({ appName, chains, projectId }))
    })
    walletGroups.push({
      groupName: 'More',
      wallets: moreWallets
        .filter((wallet) => highlightedWallet !== wallet)
        .map((wallet) => WALLETS[wallet]({ appName, chains, projectId }))
    })
  } else {
    walletGroups.push({
      groupName: 'Recommended',
      wallets: defaultWallets.map((wallet) => WALLETS[wallet]({ appName, chains, projectId }))
    })
    walletGroups.push({
      groupName: 'More',
      wallets: moreWallets.map((wallet) => WALLETS[wallet]({ appName, chains, projectId }))
    })
  }

  const connectors = connectorsForWallets(walletGroups)

  return connectors
}

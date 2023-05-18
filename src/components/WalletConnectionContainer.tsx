import { RPC_URLS } from '@constants/config'
import {
  RainbowKitProvider,
  lightTheme,
  darkTheme,
  DisclaimerComponent
} from '@rainbow-me/rainbowkit'
import { getSupportedChains } from '@utils/getSupportedChains'
import { getWalletConnectors } from '@utils/services/walletConnection'
import { jsonRpcProvider } from '@wagmi/core/providers/jsonRpc'
import { publicProvider } from '@wagmi/core/providers/public'
import { Trans } from 'next-i18next'
import { createClient, WagmiConfig, configureChains, Connector } from 'wagmi'

// Read supported chains from app config.
const supportedChains = getSupportedChains()

const { chains, provider } = configureChains(supportedChains, [
  jsonRpcProvider({
    rpc: (chain) => ({
      http: RPC_URLS[chain.id]
    })
  }),
  publicProvider()
])

const connectors: () => Connector[] = getWalletConnectors(supportedChains)

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

export const WalletConnectionContainer = (props: { children: React.ReactNode }) => {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        theme={{
          lightMode: lightTheme({
            accentColor: '#ff77e1',
            accentColorForeground: '#1A1B1F',
            borderRadius: 'small',
            overlayBlur: 'small'
          }),
          darkMode: darkTheme({
            accentColor: '#35f0d0',
            accentColorForeground: '#1A1B1F',
            borderRadius: 'small',
            overlayBlur: 'small'
          })
        }}
        chains={chains}
        appInfo={{
          appName: 'PoolTogether',
          disclaimer: Disclaimer
        }}
      >
        {props.children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <Text>
    <Trans
      i18nKey='connectWalletTermsAndDisclaimerBlurb'
      components={{
        termsLink: <Link href='https://pooltogether.com/terms/' children={undefined} />,
        disclaimerLink: (
          <Link href='https://pooltogether.com/protocol-disclaimer/' children={undefined} />
        )
      }}
    />
  </Text>
)

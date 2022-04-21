import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import tokenList from '@constants/swapTokenList'
import { CHAIN_ID } from '@constants/misc'
import { POOL_ADDRESSES } from '@constants/v3'
import { useTheme } from '@hooks/useTheme'
import { useUniswapSupportsNetwork } from '@hooks/useUniswapSupportsNetwork'
import { darkTheme, lightTheme, SwapWidget, Theme } from '@uniswap/widgets'
import { useRpcUrl, useWalletChainId, useWalletProvider } from '@pooltogether/wallet-connection'
import { RPC_API_KEYS } from '@constants/config'

export function UniswapWidgetCard() {
  const { t } = useTranslation()
  const provider = useWalletProvider()
  const walletChainId = useWalletChainId()
  const rpcUrl = useRpcUrl(walletChainId, RPC_API_KEYS)

  const { theme: ptTheme } = useTheme()
  const theme: Theme = useMemo(
    () => ({
      ...(ptTheme === 'dark' ? darkTheme : lightTheme),
      fontFamily:
        'Titillium Web, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
      accent: ptTheme === 'dark' ? '#4d249e' : '#7e46f2', // main buttons
      container: ptTheme === 'dark' ? '#341771' : '#f2edfe', // input background
      dialog: ptTheme === 'dark' ? '#341771' : '#fff', // confirmation background
      interactive: ptTheme === 'dark' ? '#4C29A1' : '#7e46f2', // token select buttons
      module: ptTheme === 'dark' ? '#301566' : '#fff', // output background
      onInteractive: '#fff', // text on interactive
      secondary: ptTheme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : lightTheme.secondary,
      tokenColorExtraction: false
    }),
    [ptTheme]
  )

  const supportsUniswap = useUniswapSupportsNetwork()

  const POOLAddress = useMemo(() => {
    if (walletChainId === CHAIN_ID.polygon) {
      return POOL_ADDRESSES[CHAIN_ID.polygon].polygon_bridge
    }
    return POOL_ADDRESSES[walletChainId]?.pool ?? POOL_ADDRESSES[CHAIN_ID.mainnet].pool
  }, [walletChainId])

  if (!supportsUniswap) {
    return null
  }
  return (
    <div>
      <h5 className='mb-2'>{t('getPool')}</h5>
      <p className='text-orange text-xs font-semibold mb-4'>
        {t(
          'poolStakingCurrentlyOnlySupportedOn',
          'POOL staking and governance is currently only available on the Ethereum network.'
        )}
      </p>
      <div>
        <SwapWidget
          jsonRpcEndpoint={rpcUrl}
          theme={theme}
          provider={provider}
          width={'100%'}
          defaultInputTokenAddress='NATIVE'
          defaultOutputTokenAddress={POOLAddress}
          tokenList={tokenList}
        />
      </div>
    </div>
  )
}

import { RPC_URL } from '@constants/customWalletsConfig'
import { CHAIN_ID } from '@constants/misc'
import tokenList from '@constants/swapTokenList'
import { POOL_ADDRESSES } from '@constants/v3'
import { useTheme } from '@hooks/useTheme'
import { useUniswapSupportsNetwork } from '@hooks/useUniswapSupportsNetwork'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { darkTheme, lightTheme, SwapWidget, Theme } from '@uniswap/widgets'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function UniswapWidgetCard() {
  const { t } = useTranslation()
  const { wallet, network } = useOnboard()

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
    if (network === CHAIN_ID.polygon) {
      return POOL_ADDRESSES[CHAIN_ID.polygon].polygon_bridge
    }
    return POOL_ADDRESSES[network]?.pool ?? POOL_ADDRESSES[CHAIN_ID.mainnet].pool
  }, [network])

  if (!supportsUniswap) {
    return null
  }
  return (
    <div>
      <h5 className='mb-2'>{t('getPool')}</h5>
      <div>
        <SwapWidget
          jsonRpcEndpoint={RPC_URL}
          theme={theme}
          provider={wallet.provider}
          width={'100%'}
          defaultInputTokenAddress='NATIVE'
          defaultOutputTokenAddress={POOLAddress}
          tokenList={tokenList}
        />
      </div>
    </div>
  )
}

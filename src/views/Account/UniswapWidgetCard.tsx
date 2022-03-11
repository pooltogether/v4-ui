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
      accent: '#4d249e',
      container: ptTheme === 'dark' ? '#341771' : '#f2edfe',
      dialog: ptTheme === 'dark' ? '#341771' : '#fff',
      interactive: ptTheme === 'dark' ? '#4C29A1' : '#4c249f',
      module: ptTheme === 'dark' ? '#301566' : '#fff',
      onInteractive: '#fff',
      secondary: 'rgba(255, 255, 255, 0.5)',
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
          className='mx-auto my-2'
          width={'100%'}
          defaultInputTokenAddress='NATIVE'
          defaultOutputTokenAddress={POOLAddress}
          tokenList={tokenList}
        />
      </div>
    </div>
  )
}

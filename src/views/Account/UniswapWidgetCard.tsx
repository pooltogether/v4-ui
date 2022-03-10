import { RPC_URL } from '@constants/customWalletsConfig'
import { useTheme } from '@hooks/useTheme'
import { useUniswapSupportsNetwork } from '@hooks/useUniswapSupportsNetwork'
import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { darkTheme, lightTheme, SwapWidget, Theme } from '@uniswap/widgets'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function UniswapWidgetCard() {
  const { t } = useTranslation()

  const { provider } = useOnboard()
  const { theme: ptTheme } = useTheme()
  const theme: Theme = useMemo(
    () => ({
      ...(ptTheme === 'dark' ? darkTheme : lightTheme),
      fontFamily:
        'Titillium Web, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
      accent: 'rgb(76, 36, 159)',
      container: ptTheme === 'dark' ? '#341771' : 'rgb(242, 237, 254)',
      dialog: ptTheme === 'dark' ? '#341771' : '#fff',
      interactive: ptTheme === 'dark' ? '#4C29A1' : 'rgb(76, 36, 159)',
      onInteractive: ptTheme === 'dark' ? '#fff' : '#fff',
      module: ptTheme === 'dark' ? '#301566' : '#fff',
      tokenColorExtraction: false
    }),
    [ptTheme]
  )

  const supportsUniswap = useUniswapSupportsNetwork()

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
          provider={provider}
          className='mx-auto my-2'
          width={'100%'}
          tokenList='https://raw.githubusercontent.com/pooltogether/pooltogether-token-list/main/pooltogether.tokenlist.json'
        />
      </div>
    </div>
  )
}

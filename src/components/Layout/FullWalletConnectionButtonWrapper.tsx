import { ButtonRadius, ButtonTheme } from '@pooltogether/react-components'
import { FullWalletConnectionButton } from '@pooltogether/wallet-connection'
import { getSupportedChains } from '@utils/getSupportedChains'
import { Trans } from 'next-i18next'

/**
 * NOTE: Only render one per app
 * @param props
 * @returns
 */
export const FullWalletConnectionButtonWrapper = (props) => {
  const chains = getSupportedChains()

  return (
    <FullWalletConnectionButton
      {...props}
      chains={chains}
      theme={ButtonTheme.transparent}
      radius={ButtonRadius.full}
      TosDisclaimer={<TosDisclaimer />}
    />
  )
}

export const TosDisclaimer = () => (
  <Trans
    i18nKey='connectWalletTermsAndDisclaimerBlurb'
    components={{
      termsLink: (
        <a
          className='text-pt-teal transition hover:opacity-70 underline'
          href='https://pooltogether.com/terms/'
          target='_blank'
          rel='noreferrer'
        />
      ),
      disclaimerLink: (
        <a
          className='text-pt-teal transition hover:opacity-70 underline'
          href='https://pooltogether.com/protocol-disclaimer/'
          target='_blank'
          rel='noreferrer'
        />
      )
    }}
  />
)

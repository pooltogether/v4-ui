import React from 'react'
import { Trans } from 'react-i18next'

import { DepositCard } from 'lib/views/Deposit/DepositCard'
import { PagePadding } from 'lib/components/Layout/PagePadding'
import { UpcomingPrizeCard } from './UpcomingPrizeCard'

export const DepositUI = () => {
  return (
    <PagePadding className='flex flex-col space-y-6'>
      <UpcomingPrizeCard className='mt-4' />
      <DepositCard />
      <div className='text-center text-xxs opacity-50 dark:hover:opacity-70 hover:opacity-90 transition pt-4 xs:pt-6 px-4'>
        <Trans
          i18nKey='connectWalletTermsAndDisclaimerBlurb'
          defaults={`By connecting a wallet, you agree to PoolTogether's <termsLink>Terms of Service</termsLink> and acknowledge that you have read and understand the <disclaimerLink>PoolTogether protocol disclaimer</disclaimerLink>`}
          components={{
            termsLink: (
              <a
                className='underline'
                target='_blank'
                rel='noopener noreferrer'
                href='https://pooltogether.com/terms'
              />
            ),
            disclaimerLink: (
              <a
                className='underline'
                target='_blank'
                rel='noopener noreferrer'
                href='https://pooltogether.com/protocol-disclaimer'
              />
            )
          }}
        />
      </div>
    </PagePadding>
  )
}

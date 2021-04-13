import React, { useContext, useEffect } from 'react'

import { useTranslation } from 'lib/../i18n'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { WalletContext } from 'lib/components/contextProviders/WalletContextProvider'
import { Button } from 'lib/components/Button'
import { PTHint } from 'lib/components/PTHint'

import PoolTogetherTrophyDetailed from 'assets/images/pooltogether-trophy--detailed.svg'

export function SignInForm(props) {
  const { t } = useTranslation()

  const { hideImg, descriptionClassName, postSignInCallback } = props

  const { handleLoadOnboard } = useContext(WalletContext)

  useEffect(() => {
    handleLoadOnboard()
  }, [])

  const { connectWallet } = useContext(AuthControllerContext)

  return (
    <>
      <div className='text-inverse'>
        {!hideImg && (
          <img src={PoolTogetherTrophyDetailed} className='mx-auto mb-6 w-16 xs:w-1/12' />
        )}

        <h5 className={descriptionClassName}>{t('connectAWalletToManageTicketsAndRewards')}</h5>

        <Button
          textSize='lg'
          onClick={(e) => {
            e.preventDefault()
            connectWallet(postSignInCallback)
          }}
        >
          {t('connectWallet')}
        </Button>

        <PTHint
          title='Ethereum'
          className='mt-4 mx-auto w-48'
          tip={
            <>
              <div className='my-2 text-xs sm:text-sm'>{t('whatIsEthereumOne')}</div>
              <div className='text-xs sm:text-sm'>{t('whatIsEthereumTwo')}</div>
            </>
          }
        >
          <span className='font-bold text-caption w-48'>{t('whatsAnEthereum')}</span>
        </PTHint>
      </div>
    </>
  )
}

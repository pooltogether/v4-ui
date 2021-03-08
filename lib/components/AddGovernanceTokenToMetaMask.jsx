import React, { useContext } from 'react'

import { useTranslation } from 'lib/../i18n'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { Button } from 'lib/components/Button'
import { addTokenToMetaMask } from 'lib/services/addTokenToMetaMask'

export function AddGovernanceTokenToMetaMask(props) {
  const { t } = useTranslation()
  const { chainId, walletName } = useContext(AuthControllerContext)

  const handleAddTokenToMetaMask = (e) => {
    e.preventDefault()
    addTokenToMetaMask(chainId)
  }

  return (
    <div className='flex flex-col sm:flex-row items-center justify-center my-20'>
      {walletName === 'MetaMask' && (
        <>
          <div className='m-2'>
            <Button tertiary onClick={handleAddTokenToMetaMask}>
              {t('addPoolTokenToMetamask')}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

import React from 'react'
import { useOnboard } from '@pooltogether/hooks'

import { useTranslation } from 'react-i18next'
import { Button } from 'lib/components/Button'
import { addTokenToMetaMask } from 'lib/services/addTokenToMetaMask'
import { useGovernanceChainId } from 'lib/hooks/useGovernanceChainId'

export function AddGovernanceTokenToMetaMask(props) {
  const { t } = useTranslation()
  const { walletName } = useOnboard()
  const chainId = useGovernanceChainId()

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

import React, { useContext, useState } from 'react'

import { useTranslation } from 'lib/../i18n'
import { SUPPORTED_CHAIN_IDS } from 'lib/constants'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { Modal } from 'lib/components/Modal'
import { chainIdToNetworkName } from 'lib/utils/chainIdToNetworkName'
import { networkBgColorClassname } from 'lib/utils/networkColorClassnames'
import { networkNameToChainId } from 'lib/utils/networkNameToChainId'

const onlyUnique = (value, index, self) => {
  return self.indexOf(value) === index
}

export function WrongNetworkModal(props) {
  const { t } = useTranslation()

  const [bypassed, setBypassed] = useState(false)

  const { networkName, supportedNetwork } = useContext(AuthControllerContext)

  let supportedNetworkNames = SUPPORTED_CHAIN_IDS.map((_chainId) => chainIdToNetworkName(_chainId))
  supportedNetworkNames = supportedNetworkNames
    .filter(onlyUnique)
    .filter((name) => name !== 'localhost')

  const handleClose = (e) => {
    e.preventDefault()

    setBypassed(true)
  }

  if (supportedNetwork) {
    return null
  }

  return (
    <>
      {bypassed && (
        <>
          <div
            className='r-0 l-0 fixed w-10/12 sm:w-1/4 bg-red px-4 py-2 font-bold mx-auto text-center rounded-lg z-50 text-white'
            style={{
              bottom: '10vh'
            }}
          >
            {t('unsupportedNetwork')} {networkName}
          </div>
        </>
      )}

      <Modal
        handleClose={handleClose}
        visible={!supportedNetwork && !bypassed}
        header={t('ethereumNetworkMismatch')}
      >
        {t('yourEthereumNetworkIsUnsupported')}{' '}
        <div className='inline-flex items-start justify-start font-bold text-white text-center mt-2'>
          {supportedNetworkNames.map((name) => {
            return (
              <div
                key={`network-${name}`}
                className={`inline-block bg-${networkBgColorClassname(
                  networkNameToChainId(name)
                )} px-2 py-1 w-24 rounded-full mr-2 mt-2 mr-2`}
              >
                {name}
              </div>
            )
          })}
        </div>
      </Modal>
    </>
  )
}

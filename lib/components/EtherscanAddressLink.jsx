import FeatherIcon from 'feather-icons-react'
import React, { useContext } from 'react'

import { formatEtherscanAddressUrl } from 'lib/utils/formatEtherscanAddressUrl'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'

export function EtherscanAddressLink (props) {
  const { address, children, className } = props

  const { chainId } = useContext(AuthControllerContext)

  const url = formatEtherscanAddressUrl(address, chainId)

  return (
    <>
      <a
        href={url}
        className={`trans no-underline ${className}`}
        target='_blank'
        rel='noopener noreferrer'
        title='View on Etherscan'
      >
        {children} <FeatherIcon icon='external-link' className='is-etherscan-arrow inline-block' />
      </a>
    </>
  )
}

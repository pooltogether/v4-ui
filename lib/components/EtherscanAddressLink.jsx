import FeatherIcon from 'feather-icons-react'
import React from 'react'

import { formatEtherscanAddressUrl } from 'lib/utils/formatEtherscanAddressUrl'
import { useOnboard } from '@pooltogether/hooks'

export function EtherscanAddressLink(props) {
  const { address, children, className } = props

  const { network: chainId } = useOnboard()

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

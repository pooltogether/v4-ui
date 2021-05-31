import FeatherIcon from 'feather-icons-react'
import React from 'react'

import { formatEtherscanAddressUrl } from 'lib/utils/formatEtherscanAddressUrl'
import { useGovernanceChainId } from 'lib/hooks/useGovernanceChainId'

export function EtherscanAddressLink(props) {
  const { address, children, className } = props

  const chainId = useGovernanceChainId()

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

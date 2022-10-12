import { NetworkIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { PrizeDistributor } from '@pooltogether/v4-client-js'

export const PrizeDistributorLabel = (props: { prizeDistributor: PrizeDistributor }) => {
  const { prizeDistributor } = props
  return (
    <div className='flex items-center space-x-2'>
      <NetworkIcon chainId={prizeDistributor.chainId} />
      <span className='block xs:hidden sm:block'>
        {getNetworkNiceNameByChainId(prizeDistributor.chainId)}
      </span>
    </div>
  )
}

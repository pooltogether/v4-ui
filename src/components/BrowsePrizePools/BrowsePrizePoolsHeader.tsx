import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { useV4ChainIds } from '@hooks/v4/useV4ChainIds'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import classNames from 'classnames'

export const BrowsePrizePoolsHeader: React.FC<{ className?: string }> = (props) => {
  const { className } = props
  const chainIds = useV4ChainIds()
  const { setSelectedChainId } = useSelectedChainId()

  return (
    <div className={classNames(className)}>
      <div className='flex justify-between mb-2 items-center'>
        <div className='font-bold text-xl'>Browse prize pools</div>
        {/* TODO: Add back the network filter later */}
        {/* <select
          name='prizePoolNetwork'
          id='prizePoolNetwork'
          className={classNames(
            'font-semibold transition focus:outline-none bg-transparent opacity-70 hover:opacity-100 cursor-pointer text-sm xs:text-base'
          )}
          onChange={(event) => setSelectedChainId(Number(event.target.value))}
        >
          {chainIds.map((chainId) => (
            <option key={chainId} value={chainId}>
              {getNetworkNiceNameByChainId(chainId)}
            </option>
          ))}
        </select> */}
      </div>
      <div className='opacity-80'>
        Join any prize pool for a chance to win prizes daily! I know, it sounds crazy.
      </div>
    </div>
  )
}

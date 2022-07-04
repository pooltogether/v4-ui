import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { useSelectedPrizePoolAddress } from '@hooks/useSelectedPrizePoolAddress'
import { usePrizePools } from '@hooks/v4/PrizePool/usePrizePools'
import { usePrizePoolTokens } from '@pooltogether/hooks'
import { NetworkIcon, TokenIcon, ViewProps } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId, shorten } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

export const ExplorePrizePoolsModalView: React.FC<{} & ViewProps> = (props) => {
  const { previous } = props

  const prizePools = usePrizePools()
  const { t } = useTranslation()
  const { chainId: selectedChainId, setSelectedChainId } = useSelectedChainId()
  const { prizePoolAddress: selectedPrizePoolAddress, setSelectedPrizePoolAddress } =
    useSelectedPrizePoolAddress()

  // Explore button to go there
  // Submit for valid hook-form moves to confirm view with a TxButton
  return (
    <div>
      <p className='max-w-sm mx-auto text-xs mb-12 text-center'>
        Different prize pools have different yield sources, different prizes and different ways to
        win!
      </p>
      <ul className='space-y-2 mx-auto max-w-sm'>
        {prizePools.map((prizePool) => (
          <PrizePoolListItem
            key={prizePool.id()}
            prizePool={prizePool}
            isSelected={
              prizePool.chainId === selectedChainId &&
              prizePool.address === selectedPrizePoolAddress
            }
            onSelect={previous}
            setSelectedChainId={setSelectedChainId}
            setSelectedPrizePoolAddress={setSelectedPrizePoolAddress}
          />
        ))}
      </ul>
    </div>
  )
}

const PrizePoolListItem = (props: {
  prizePool: PrizePool
  isSelected: boolean
  onSelect: (prizePool: PrizePool) => void
  setSelectedChainId: (chainId: number) => void
  setSelectedPrizePoolAddress: (address: string) => void
}) => {
  const { prizePool, isSelected, setSelectedChainId, setSelectedPrizePoolAddress, onSelect } = props
  const { chainId, address } = prizePool
  const { data: tokens } = usePrizePoolTokens(prizePool)
  return (
    <li>
      <button
        onClick={() => {
          setSelectedPrizePoolAddress(address)
          setSelectedChainId(chainId)
          onSelect?.(prizePool)
        }}
        className={classNames(
          'bg-pt-purple-lighter dark:bg-pt-purple-darker rounded-lg p-4 flex items-center w-full transition-colors',
          'border  hover:border-highlight-1',
          {
            'border-default': isSelected,
            'border-transparent': !isSelected
          }
        )}
      >
        <PrizePoolIdentifier
          chainId={chainId}
          prizePoolAddress={prizePool.address}
          token={tokens?.token}
        />
      </button>
    </li>
  )
}

const PrizePoolIdentifier: React.FC<{ chainId: number; prizePoolAddress: string; token: Token }> = (
  props
) => {
  const { chainId, prizePoolAddress, token } = props
  return (
    <div className='flex space-x-2'>
      <NetworkIcon chainId={chainId} sizeClassName='w-5 h-5' />
      <span className='capitalize leading-none tracking-wider font-bold text-lg'>
        {getNetworkNiceNameByChainId(chainId)}
      </span>
      {!!token && (
        <>
          <TokenIcon chainId={chainId} address={token.address} />
          <span className='capitalize leading-none tracking-wider font-bold text-lg'>
            {token.symbol}
          </span>
        </>
      )}
      <span className='capitalize leading-none tracking-wider font-bold text-lg'>
        {shorten({ hash: prizePoolAddress, short: true })}
      </span>
    </div>
  )
}

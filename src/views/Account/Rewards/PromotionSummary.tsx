import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { useTranslation } from 'react-i18next'
import { sToD, sToMs, numberWithCommas } from '@pooltogether/utilities'
import { useTokenBalance } from '@pooltogether/hooks'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import { BlockExplorerLink } from '@pooltogether/react-components'
import { format } from 'date-fns'
import { TokenIcon } from '@pooltogether/react-components'
import classNames from 'classnames'
// import { SummaryWell } from './SummaryWell'
// import { TokenDisplay } from './TokenDisplay'

interface PromotionSummaryProps {
  chainId: number
  token: string
  startTimestamp: number
  tokensPerEpoch: BigNumber
  epochDuration: number
  numberOfEpochs: number
  networkName: string
  className?: string
}

export const PromotionSummary = (props: PromotionSummaryProps) => {
  const {
    chainId,
    startTimestamp,
    numberOfEpochs,
    epochDuration,
    tokensPerEpoch,
    token,
    networkName
  } = props

  const usersAddress = useUsersAddress()

  const { data: tokenData, isFetched: tokenDataIsFetched } = useTokenBalance(
    chainId,
    usersAddress,
    token
  )

  if (
    !Boolean(numberOfEpochs) ||
    !Boolean(epochDuration) ||
    !Boolean(tokensPerEpoch) ||
    !tokenDataIsFetched ||
    !tokenData?.name
  ) {
    return null
  }

  return (
    <>
      <div className='dark:text-white'>
        <span>
          {numberWithCommas(
            formatUnits(tokensPerEpoch.mul(numberOfEpochs), tokenData?.decimals).toString()
          )}
        </span>{' '}
        of <TokenSymbol chainId={chainId} tokenData={tokenData} /> token rewards will be provided
        over the next 14 days to all depositors on {networkName}.
      </div>
      {/* <BlockExplorerLink className='flex items-center' chainId={chainId} address={token} noIcon>
          <TokenDisplay chainId={chainId} tokenData={tokenData} />
        </BlockExplorerLink> */}

      <div className='opacity-70 text-xxs'>
        <span className='font-bold'>Starts:</span>{' '}
        <StartTimestampDisplay startTimestamp={startTimestamp} />
        <br />
        <span className='font-bold'>Ends:</span>{' '}
        <EndTimestampDisplay
          startTimestamp={startTimestamp}
          numberOfEpochs={numberOfEpochs}
          epochDuration={epochDuration}
        />
      </div>
    </>
  )
}

/**
 *
 * @param props
 * @returns
 */
const StartTimestampDisplay: React.FC<{
  startTimestamp: number
}> = ({ startTimestamp }) => {
  const { t } = useTranslation()
  return (
    <span>
      {format(new Date(sToMs(startTimestamp)), 'MMMM do yyyy')} @{' '}
      {format(new Date(sToMs(startTimestamp)), 'p')}
    </span>
  )
}

/**
 *
 * @param props
 * @returns
 */
const EndTimestampDisplay: React.FC<{
  startTimestamp: number
  numberOfEpochs: number
  epochDuration: number
}> = ({ startTimestamp, numberOfEpochs, epochDuration }) => {
  const { t } = useTranslation()

  const duration = Number(numberOfEpochs) * Number(epochDuration)
  const endTimestamp = Number(startTimestamp) + duration

  return (
    <span>
      {format(new Date(sToMs(endTimestamp)), 'MMMM do yyyy')} @{' '}
      {format(new Date(sToMs(endTimestamp)), 'p')}
    </span>
  )
}

export const TokenDisplay = (props) => {
  const { chainId, tokenData, className } = props

  if (!tokenData) {
    return null
  }

  return (
    <div className={classNames(className, 'inline-flex items-center dark:text-white text-xxs')}>
      {tokenData?.address && (
        <TokenIcon
          sizeClassName='w-4 h-4'
          className='mr-1'
          chainId={chainId}
          address={tokenData?.address}
        />
      )}
      <span className='mr-1'>{tokenData?.name}</span>
    </div>
  )
}

export const TokenSymbol = (props) => {
  const { tokenData } = props

  if (!tokenData) {
    return null
  }

  return <span>{tokenData?.symbol}</span>
}

// export const SummaryWell = (props) => {
//   const { className, children, hidden, hideBackground } = props
//   return (
//     <div
//       className={classNames(
//         className,
//         'mt-1 rounded-lg dark:text-white text-xxs  text-opacity-70',
//         {
//           hidden,
//           'bg-opacity-40 bg-pt-purple-dark': !hideBackground,
//           'px-3 py-1': !className
//         }
//       )}
//     >
//       {children}
//     </div>
//   )
// }

// SummaryWell.defaultProps = {
//   hideBackground: false
// }

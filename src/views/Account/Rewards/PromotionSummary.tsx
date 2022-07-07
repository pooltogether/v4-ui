import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'
import classNames from 'classnames'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { useTranslation } from 'react-i18next'
import { getNetworkNiceNameByChainId, sToMs, numberWithCommas } from '@pooltogether/utilities'
import { useToken } from '@pooltogether/hooks'
import { format } from 'date-fns'
import { TokenIcon } from '@pooltogether/react-components'
import { Trans } from 'react-i18next'

import { CHAIN_ID, SECONDS_PER_DAY } from '@constants/misc'
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

const days = (numberOfEpochs, epochDuration) => {
  const duration = Number(numberOfEpochs) * Number(epochDuration)
  return duration / SECONDS_PER_DAY
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

  const { data: tokenData, isFetched: tokenDataIsFetched } = useToken(chainId, token)
  const { t } = useTranslation()

  if (
    !Boolean(numberOfEpochs) ||
    !Boolean(epochDuration) ||
    !Boolean(tokensPerEpoch) ||
    !tokenDataIsFetched ||
    !tokenData?.name
  ) {
    return null
  }

  const totalTokens = tokensPerEpoch.mul(numberOfEpochs)
  const totalTokensFormatted = formatUnits(totalTokens, tokenData?.decimals)

  return (
    <>
      <div className='w-full xs:w-10/12'>
        <div className='dark:text-white leading-snug'>
          <Trans
            i18nKey='numTokensProvidedOverDaysToDepositorsOnNetwork'
            values={{
              totalTokens: numberWithCommas(totalTokensFormatted, { removeTrailingZeros: true }),
              days: numberWithCommas(days(numberOfEpochs, epochDuration), {
                removeTrailingZeros: true
              }),
              networkName
            }}
            components={{
              token: (
                <>
                  <TokenIcon
                    sizeClassName='w-4 h-4'
                    className='relative mr-1'
                    chainId={chainId}
                    address={tokenData.address}
                    style={{ top: -2 }}
                  />
                  <TokenSymbol chainId={chainId} tokenData={tokenData} />
                </>
              )
            }}
          />
        </div>
      </div>

      <div
        className={classNames(
          'flex items-center justify-end w-full font-averta-bold space-x-4 mt-4'
        )}
      >
        <Link href={`/deposit?network=${getNetworkNiceNameByChainId(chainId).toLowerCase()}`}>
          <a className='flex items-center h-8 uppercase text-white text-opacity-80 hover:text-opacity-100'>
            {t('deposit')} <FeatherIcon icon='chevron-right' className={'relative w-4 h-4'} />
          </a>
        </Link>

        {chainId === CHAIN_ID.optimism && (
          <a
            href={`https://app.optimism.io/bridge`}
            target='_blank'
            className='flex items-center h-8 uppercase text-white text-opacity-80 hover:text-opacity-100'
          >
            {t('bridge')}{' '}
            <FeatherIcon
              icon='external-link'
              className={'relative w-4 h-4 ml-2'}
              style={{ top: -1 }}
            />
          </a>
        )}
      </div>

      {/* <BlockExplorerLink className='flex items-center' chainId={chainId} address={token} noIcon>
          <TokenDisplay chainId={chainId} tokenData={tokenData} />
        </BlockExplorerLink> */}
      {/* 
      <div className='opacity-70 text-xxs mt-2'>
        <span className='font-bold'>Starts:</span>{' '}
        <StartTimestampDisplay startTimestamp={startTimestamp} />
        <br />
        <span className='font-bold'>Ends:</span>{' '}
        <EndTimestampDisplay
          startTimestamp={startTimestamp}
          numberOfEpochs={numberOfEpochs}
          epochDuration={epochDuration}
        />
      </div> */}
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

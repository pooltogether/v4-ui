import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'
import classNames from 'classnames'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import { useTranslation } from 'react-i18next'
import { getNetworkNiceNameByChainId, sToMs, numberWithCommas } from '@pooltogether/utilities'
import { useToken } from '@pooltogether/hooks'
import { TokenIcon } from '@pooltogether/react-components'
import { Trans } from 'react-i18next'

import { CHAIN_ID, SECONDS_PER_DAY } from '@constants/misc'

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

const getPromotionDurationInDays = (numberOfEpochs, epochDuration) => {
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
              days: numberWithCommas(getPromotionDurationInDays(numberOfEpochs, epochDuration), {
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
                  <span>{tokenData?.symbol}</span>
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
    </>
  )
}

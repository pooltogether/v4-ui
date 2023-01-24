import { SECONDS_PER_DAY } from '@constants/misc'
import { useToken } from '@pooltogether/hooks'
import { TokenIcon } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId, numberWithCommas } from '@pooltogether/utilities'
import { CHAIN_ID } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import { BigNumber } from 'ethers'
import { formatUnits } from 'ethers/lib/utils'
import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import { Trans } from 'next-i18next'

interface PromotionSummaryProps {
  chainId: number
  token: string
  startTimestamp: number
  tokensPerEpoch: BigNumber
  epochDuration: number
  numberOfEpochs: number
  networkName: string
  className?: string
  onDepositClick: () => void
}

const getPromotionDurationInDays = (numberOfEpochs, epochDuration) => {
  const duration = Number(numberOfEpochs) * Number(epochDuration)
  return duration / SECONDS_PER_DAY
}

export const PromotionSummary = (props: PromotionSummaryProps) => {
  const {
    chainId,
    onDepositClick,
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
        <div className='dark:text-white leading-snug text-xxs xs:text-xs'>
          <Trans
            i18nKey='numTokensProvidedOverDaysToDepositorsOnNetwork'
            values={{
              networkName
            }}
            components={{
              days: (
                <span className='font-bold'>
                  <span>
                    {numberWithCommas(getPromotionDurationInDays(numberOfEpochs, epochDuration), {
                      removeTrailingZeros: true
                    })}
                  </span>
                  <span className='ml-1'>{t('days')}</span>
                </span>
              ),
              token: (
                <span className='font-bold'>
                  <span className='mr-1'>{numberWithCommas(totalTokensFormatted)}</span>
                  <TokenIcon
                    sizeClassName='w-4 h-4'
                    className='relative mr-1'
                    chainId={chainId}
                    address={tokenData.address}
                    style={{ top: -2 }}
                  />
                  <span>{tokenData?.symbol}</span>
                </span>
              )
            }}
          />
        </div>
      </div>

      <div
        className={classNames(
          'flex flex-row justify-end sm:flex-col sm:justify-start w-full font-bold space-x-4 sm:space-x-0 mt-4'
        )}
      >
        <button
          onClick={onDepositClick}
          className='flex font-bold transition items-center h-8 text-white text-opacity-80 hover:text-opacity-100'
        >
          {t('deposit')} <FeatherIcon icon='chevron-right' className={'relative w-4 h-4'} />
        </button>

        {chainId === CHAIN_ID.optimism && (
          <a
            href={`https://app.optimism.io/bridge`}
            target='_blank'
            rel='noreferrer'
            className='flex items-center h-8 text-white text-opacity-80 hover:text-opacity-100'
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

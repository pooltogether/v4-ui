import { ThemedClipSpinner } from '.yalc/@pooltogether/react-components/dist'
import { PrizePool } from '.yalc/@pooltogether/v4-js-client/dist'
import { numberWithCommas } from '@pooltogether/utilities'
import { BigNumber } from 'ethers'
import { InfoListItem } from 'lib/components/InfoList'
import {
  useApproveDepositsGasEstimate,
  useDepositGasEstimate,
  useWithdrawGasEstimate
} from 'lib/hooks/Tsunami/PrizePool/useGasEstimates'

import { useChainNativeCurrency } from 'lib/hooks/useChainNativeCurrency'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface EstimatedGasItemProps {
  chainId: number
  gasEstimate: BigNumber
  isFetched: boolean
  invalidInput?: boolean
}

export const EstimatedGasItem = (props: EstimatedGasItemProps) => {
  const { gasEstimate, isFetched, invalidInput, chainId } = props
  const nativeCurrency = useChainNativeCurrency(chainId)
  const { t } = useTranslation()

  if (invalidInput) {
    return <InfoListItem dimValue label={t('networkFees', 'Network fees')} value='--' />
  }

  if (!isFetched) {
    return (
      <InfoListItem
        dimValue
        label={t('networkFees', 'Network fees')}
        value={<ThemedClipSpinner className='my-auto' size={16} />}
      />
    )
  }

  if (!gasEstimate) {
    return (
      <InfoListItem
        dimValue
        label={t('networkFees', 'Network fees')}
        value={t('errorEstimating', 'Error estimating')}
      />
    )
  }

  return (
    <InfoListItem
      dimValue
      label={t('networkFees', 'Network fees')}
      value={`${numberWithCommas(gasEstimate, { decimals: '18' })} ${nativeCurrency}`}
    />
  )
}

interface EstimatedPrizePoolGasItemProps {
  prizePool: PrizePool
}

interface EstimatedPrizePoolGasItemWithAmountProps extends EstimatedPrizePoolGasItemProps {
  amountUnformatted: BigNumber
}

export const EstimatedDepositGasItem = (props: EstimatedPrizePoolGasItemWithAmountProps) => {
  const { prizePool, amountUnformatted } = props
  const { data: gasEstimate, isFetched } = useDepositGasEstimate(prizePool, amountUnformatted)

  return (
    <EstimatedGasItem
      chainId={prizePool.chainId}
      invalidInput={!amountUnformatted || amountUnformatted.isZero()}
      gasEstimate={gasEstimate}
      isFetched={isFetched}
    />
  )
}

export const EstimatedWithdrawalGasItem = (props: EstimatedPrizePoolGasItemWithAmountProps) => {
  const { prizePool, amountUnformatted } = props
  const { data: gasEstimate, isFetched } = useWithdrawGasEstimate(prizePool, amountUnformatted)

  return (
    <EstimatedGasItem
      chainId={prizePool.chainId}
      invalidInput={!amountUnformatted || amountUnformatted.isZero()}
      gasEstimate={gasEstimate}
      isFetched={isFetched}
    />
  )
}

export const EstimatedApproveDepositsGasItem = (props: EstimatedPrizePoolGasItemProps) => {
  const { prizePool } = props
  const { data: gasEstimate, isFetched } = useApproveDepositsGasEstimate(prizePool)

  return (
    <EstimatedGasItem chainId={prizePool.chainId} gasEstimate={gasEstimate} isFetched={isFetched} />
  )
}

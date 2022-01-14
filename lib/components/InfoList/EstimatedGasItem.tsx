import React from 'react'
import FeatherIcon from 'feather-icons-react'
import { useGasCostEstimate } from '@pooltogether/hooks'
import { BigNumber } from 'ethers'
import { useTranslation } from 'react-i18next'
import { Tooltip, ThemedClipSpinner } from '@pooltogether/react-components'
import { numberWithCommas } from '@pooltogether/utilities'

import { InfoListItem } from 'lib/components/InfoList'
import { useChainNativeCurrency } from 'lib/hooks/useChainNativeCurrency'

interface EstimatedGasItemProps {
  chainId: number
  isFetched: boolean
  txName: string
  totalGasWei?: number
  totalGasUsd?: number
  error?: unknown
}

export const EstimatedGasItem = (props: EstimatedGasItemProps) => {
  const { txName, totalGasWei, totalGasUsd, isFetched, chainId } = props
  const nativeCurrency = useChainNativeCurrency(chainId)
  const { t } = useTranslation()
  const label = t('estimatedNetworkFees', 'Estimated network fees')

  let valueJsx

  if (!isFetched) {
    valueJsx = <ThemedClipSpinner className='my-auto' size={16} />
  }

  if (isFetched && totalGasWei) {
    valueJsx = (
      <Tooltip
        id={`tooltip-est-gas-costs-wei-${txName}`}
        tip={
          <>
            {numberWithCommas(totalGasWei)} {nativeCurrency}
          </>
        }
      >
        <span className='text-inverse'>${numberWithCommas(totalGasUsd, { precision: 2 })}</span>
      </Tooltip>
    )
  }

  if (isFetched && !totalGasWei) {
    valueJsx = (
      <Tooltip
        id={`tooltip-est-gas-costs-${txName}`}
        tip={t('errorEstimatingGasCosts', 'Error estimating gas costs')}
      >
        <FeatherIcon
          icon={'help-circle'}
          className='relative w-4 h-4 mr-1 inline-block'
          style={{ top: -1 }}
        />
      </Tooltip>
    )
  }

  return <InfoListItem label={label} value={valueJsx} />
}

interface EstimatedTxWithAmountProps {
  chainId: number
  amountUnformatted?: BigNumber
}

// hard-coded gas used while testing in Wei
const DEPOSIT_GAS_AMOUNT = BigNumber.from('243724')
const WITHDRAW_GAS_AMOUNT = BigNumber.from('176702')
const APPROVE_GAS_AMOUNT = BigNumber.from('46614')

export const EstimatedApproveAndDepositGasItem = (props: EstimatedTxWithAmountProps) => {
  const { chainId } = props

  let totalGasWei, totalGasUsd

  const {
    totalGasWei: depositTotalGasWei,
    totalGasUsd: depositTotalGasUsd,
    isFetched: depositIsFetched,
    error: depositError
  } = useGasCostEstimate(DEPOSIT_GAS_AMOUNT, chainId)

  const {
    totalGasWei: approveTotalGasWei,
    totalGasUsd: approveTotalGasUsd,
    isFetched: approveIsFetched,
    error: approveError
  } = useGasCostEstimate(APPROVE_GAS_AMOUNT, chainId)

  const isFetched = depositIsFetched && approveIsFetched
  const error = depositError && approveError

  if (isFetched && !error && depositTotalGasWei && depositTotalGasUsd) {
    totalGasWei = depositTotalGasWei.add(approveTotalGasWei)
    totalGasUsd = depositTotalGasUsd.add(approveTotalGasUsd)
  }

  return (
    <EstimatedGasItem
      txName='approve-and-deposit'
      totalGasWei={totalGasWei}
      totalGasUsd={totalGasUsd}
      chainId={chainId}
      isFetched={isFetched}
      error={error}
    />
  )
}

export const EstimatedDepositGasItem = (props: EstimatedTxWithAmountProps) => {
  const { chainId } = props

  const { totalGasWei, totalGasUsd, isFetched, error } = useGasCostEstimate(
    DEPOSIT_GAS_AMOUNT,
    chainId
  )

  return (
    <EstimatedGasItem
      txName='deposit'
      totalGasWei={totalGasWei}
      totalGasUsd={totalGasUsd}
      chainId={chainId}
      isFetched={isFetched}
      error={error}
    />
  )
}

export const EstimatedWithdrawalGasItem = (props: EstimatedTxWithAmountProps) => {
  const { chainId, amountUnformatted } = props

  const { totalGasWei, totalGasUsd, isFetched, error } = useGasCostEstimate(
    WITHDRAW_GAS_AMOUNT,
    chainId
  )

  return (
    <EstimatedGasItem
      txName='withdraw'
      totalGasWei={totalGasWei}
      totalGasUsd={totalGasUsd}
      chainId={chainId}
      isFetched={isFetched}
      error={error}
    />
  )
}

export const EstimatedApproveDepositsGasItem = (props: EstimatedTxWithAmountProps) => {
  const { chainId } = props

  const { totalGasWei, totalGasUsd, isFetched, error } = useGasCostEstimate(
    APPROVE_GAS_AMOUNT,
    chainId
  )

  return (
    <EstimatedGasItem
      txName='approve'
      totalGasWei={totalGasWei}
      totalGasUsd={totalGasUsd}
      chainId={chainId}
      isFetched={isFetched}
      error={error}
    />
  )
}

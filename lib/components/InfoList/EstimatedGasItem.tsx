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
  label: string
  totalGasWei?: number
  totalGasUsd?: number
  error?: unknown
}

export const EstimatedGasItem = (props: EstimatedGasItemProps) => {
  const { txName, totalGasWei, totalGasUsd, isFetched, chainId, label } = props
  const nativeCurrency = useChainNativeCurrency(chainId)

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
  label?: string
  chainId: number
  amountUnformatted?: BigNumber
}

interface SimpleEstimatedGasItemProps extends EstimatedTxWithAmountProps {
  gasAmount: BigNumber
  txName: string
}

// hard-coded gas used while testing in Wei
const DEPOSIT_GAS_AMOUNT = BigNumber.from('500000')
const CLAIM_GAS_AMOUNT = BigNumber.from('400000')
const WITHDRAW_GAS_AMOUNT = BigNumber.from('450000')
const APPROVE_GAS_AMOUNT = BigNumber.from('50000')

export const EstimatedApproveAndDepositGasItem = (props: EstimatedTxWithAmountProps) => {
  const { chainId } = props

  let totalGasWei, totalGasUsd

  const { t } = useTranslation()

  const {
    totalGasWei: depositTotalGasWei,
    totalGasUsd: depositTotalGasUsd,
    isFetched: isDepositFetched,
    error: depositError
  } = useGasCostEstimate(DEPOSIT_GAS_AMOUNT, chainId)

  const {
    totalGasWei: approveTotalGasWei,
    totalGasUsd: approveTotalGasUsd,
    isFetched: isApproveFetched,
    error: approveError
  } = useGasCostEstimate(APPROVE_GAS_AMOUNT, chainId)

  const isFetched = isDepositFetched && isApproveFetched
  const error = depositError && approveError

  if (isFetched && !error && depositTotalGasWei && depositTotalGasUsd) {
    totalGasWei = depositTotalGasWei.add(approveTotalGasWei)
    totalGasUsd = depositTotalGasUsd.add(approveTotalGasUsd)
  }

  return (
    <EstimatedGasItem
      label={t('estimatedNetworkFees', 'Estimated network fees')}
      txName='approve-and-deposit'
      totalGasWei={totalGasWei}
      totalGasUsd={totalGasUsd}
      chainId={chainId}
      isFetched={isFetched}
      error={error}
    />
  )
}

const SimpleEstimatedGasItem = (props: SimpleEstimatedGasItemProps) => {
  const { chainId, label, txName, gasAmount } = props

  const { t } = useTranslation()

  const { totalGasWei, totalGasUsd, isFetched, error } = useGasCostEstimate(gasAmount, chainId)

  return (
    <EstimatedGasItem
      label={label || t('estimatedNetworkFees', 'Estimated network fees')}
      txName={txName}
      totalGasWei={totalGasWei}
      totalGasUsd={totalGasUsd}
      chainId={chainId}
      isFetched={isFetched}
      error={error}
    />
  )
}

export const EstimatedWithdrawalGasItem = (props: EstimatedTxWithAmountProps) => (
  <SimpleEstimatedGasItem {...props} txName='withdraw' gasAmount={WITHDRAW_GAS_AMOUNT} />
)
export const EstimatedDepositGasItem = (props: EstimatedTxWithAmountProps) => (
  <SimpleEstimatedGasItem {...props} txName='deposit' gasAmount={DEPOSIT_GAS_AMOUNT} />
)
export const EstimatedApproveGasItem = (props: EstimatedTxWithAmountProps) => (
  <SimpleEstimatedGasItem {...props} txName='approve' gasAmount={APPROVE_GAS_AMOUNT} />
)
export const EstimatedClaimPrizesGasItem = (props: EstimatedTxWithAmountProps) => (
  <SimpleEstimatedGasItem {...props} txName='claim' gasAmount={CLAIM_GAS_AMOUNT} />
)

interface EstimatedDepositGasItems extends EstimatedTxWithAmountProps {
  showApprove?: boolean
}

export const EstimatedDepositGasItems = (props: EstimatedDepositGasItems) => {
  const { t } = useTranslation()

  return (
    <>
      <InfoListItem
        className='font-semibold text-pt-purple-light'
        label={t('estimatedNetworkFees', 'Estimated network fees')}
        value={undefined}
      />

      {props.showApprove && <EstimatedApproveGasItem {...props} label={t('approveDeposits')} />}
      <EstimatedDepositGasItem {...props} label={t('deposit')} />
      <EstimatedClaimPrizesGasItem {...props} label={t('prizeClaims', 'Prize claims')} />
      <EstimatedWithdrawalGasItem {...props} label={t('withdrawal', 'Withdrawal')} />
    </>
  )
}

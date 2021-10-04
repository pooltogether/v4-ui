import React from 'react'
import FeatherIcon from 'feather-icons-react'
import { useGasCostEstimate } from '@pooltogether/hooks'
import { BigNumber } from 'ethers'
import { useTranslation } from 'react-i18next'
import { Tooltip, ThemedClipSpinner } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-js-client'
import { numberWithCommas } from '@pooltogether/utilities'

// import {
//   useApproveDepositsGasEstimate,
//   useDepositGasEstimate,
//   useWithdrawGasEstimate
// } from 'lib/hooks/Tsunami/PrizePool/useGasEstimates'
import { InfoListItem } from 'lib/components/InfoList'
import { useChainNativeCurrency } from 'lib/hooks/useChainNativeCurrency'

interface EstimatedGasItemProps {
  chainId: number
  isFetched: boolean
  txName: string
  totalGasWei?: number
  totalGasUsd?: number
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
      <>
        <span className='opacity-60'> (${numberWithCommas(totalGasUsd)})</span>{' '}
        {numberWithCommas(totalGasWei)} {nativeCurrency}
      </>
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

  return <InfoListItem dimValue label={label} value={valueJsx} />
}

interface EstimatedPrizePoolGasItemProps {
  prizePool: PrizePool
}

interface EstimatedPrizePoolGasItemWithAmountProps extends EstimatedPrizePoolGasItemProps {
  amountUnformatted: BigNumber
}

// hard-coded gas used while testing in Wei
const DEPOSIT_GAS_AMOUNT = BigNumber.from('190128')
const WITHDRAW_GAS_AMOUNT = BigNumber.from('176702')
const APPROVE_GAS_AMOUNT = BigNumber.from('11111')

export const EstimatedDepositGasItem = (props: EstimatedPrizePoolGasItemWithAmountProps) => {
  const { prizePool } = props

  // const { prizePool, amountUnformatted } = props
  // const { data: gasAmount, isFetched } = useDepositGasEstimate(prizePool, amountUnformatted)

  const { totalGasWei, totalGasUsd, isFetched } = useGasCostEstimate(
    DEPOSIT_GAS_AMOUNT,
    prizePool.chainId
  )

  return (
    <EstimatedGasItem
      txName='deposit'
      totalGasWei={totalGasWei}
      totalGasUsd={totalGasUsd}
      chainId={prizePool.chainId}
      isFetched={isFetched}
    />
  )
}

export const EstimatedWithdrawalGasItem = (props: EstimatedPrizePoolGasItemWithAmountProps) => {
  const { prizePool, amountUnformatted } = props
  // const { data: gasEstimate, isFetched } = useWithdrawGasEstimate(prizePool, amountUnformatted)

  const { totalGasWei, totalGasUsd, isFetched } = useGasCostEstimate(
    WITHDRAW_GAS_AMOUNT,
    prizePool.chainId
  )

  return (
    <EstimatedGasItem
      txName='withdraw'
      totalGasWei={totalGasWei}
      totalGasUsd={totalGasUsd}
      chainId={prizePool.chainId}
      isFetched={isFetched}
    />
  )
}

export const EstimatedApproveDepositsGasItem = (props: EstimatedPrizePoolGasItemProps) => {
  const { prizePool } = props
  // const { data: gasEstimate, isFetched } = useApproveDepositsGasEstimate(prizePool)

  const { totalGasWei, totalGasUsd, isFetched } = useGasCostEstimate(
    APPROVE_GAS_AMOUNT,
    prizePool.chainId
  )

  return (
    <EstimatedGasItem
      txName='approve'
      totalGasWei={totalGasWei}
      totalGasUsd={totalGasUsd}
      chainId={prizePool.chainId}
      isFetched={isFetched}
    />
  )
}

import React from 'react'
import FeatherIcon from 'feather-icons-react'
import { BigNumber } from 'ethers'
import { parseUnits } from '@ethersproject/units'
import { useTranslation } from 'react-i18next'
import { Tooltip, ThemedClipSpinner } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-js-client'
import { numberWithCommas } from '@pooltogether/utilities'
import { useCoingeckoSimplePrices } from '@pooltogether/hooks'

import { useGasCosts } from 'lib/hooks/useGasCosts'

import {
  useApproveDepositsGasEstimate,
  useDepositGasEstimate,
  useWithdrawGasEstimate
} from 'lib/hooks/Tsunami/PrizePool/useGasEstimates'
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

const SIMPLE_PRICES_CHAIN_ID_MAP = {
  1: 'ethereum',
  4: 'ethereum',
  137: 'matic-network',
  80001: 'matic-network'
}

// Actual deposit gas used in Wei
const DEPOSIT_GAS_AMOUNT = BigNumber.from('190128')

const GAS_COST_CHAIN_ID_MAP = {
  1: 1,
  4: 1,
  137: 137,
  80001: 137
}

// Makes use of Coingecko for USD prices (of ether, matic, etc) and PoolTogether's gas API result
// to calculate how much gas will probably cost in both USD and the native currency
const useGasCostEstimate = (gasAmount, chainId) => {
  const { data: prices, isFetched: pricesIsFetched } = useCoingeckoSimplePrices()

  const mappedChainId = GAS_COST_CHAIN_ID_MAP[chainId]
  const { data: gasCosts, isFetched: gasCostsIsFetched } = useGasCosts(mappedChainId)

  const isFetched = pricesIsFetched && gasCostsIsFetched

  let totalGasUsd, totalGasWei
  if (isFetched) {
    totalGasWei = calculateTotalGasWei(gasCosts, gasAmount)
    totalGasUsd = calculateTotalGasUsd(prices, chainId, totalGasWei)
  }

  return { totalGasWei, totalGasUsd, isFetched }
}

const calculateTotalGasUsd = (prices, chainId, totalGasWei) => {
  const { usd } = prices[SIMPLE_PRICES_CHAIN_ID_MAP[chainId]]
  return totalGasWei.mul((usd * 100).toString()).div(100)
}

const calculateTotalGasWei = (gasCosts, gasAmount) => {
  const standardGasCostGwei = gasCosts.ProposeGasPrice

  // Convert gwei to wei
  const standardGasCostWei = BigNumber.from(standardGasCostGwei).mul(parseUnits('1', 9))

  return gasAmount.mul(standardGasCostWei)
}

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
  const { data: gasEstimate, isFetched } = useWithdrawGasEstimate(prizePool, amountUnformatted)

  return <EstimatedGasItem txName='withdraw' chainId={prizePool.chainId} isFetched={isFetched} />
}

export const EstimatedApproveDepositsGasItem = (props: EstimatedPrizePoolGasItemProps) => {
  const { prizePool } = props
  const { data: gasEstimate, isFetched } = useApproveDepositsGasEstimate(prizePool)

  return <EstimatedGasItem txName='approve' chainId={prizePool.chainId} isFetched={isFetched} />
}

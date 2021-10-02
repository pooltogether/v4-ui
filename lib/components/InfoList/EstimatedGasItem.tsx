import React from 'react'
import { BigNumber, constants } from 'ethers'
import { parseUnits } from '@ethersproject/units'
import { useTranslation } from 'react-i18next'
import { ThemedClipSpinner } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-js-client'
import { numberWithCommas } from '@pooltogether/utilities'
import { useCoingeckoSimplePrices } from '@pooltogether/hooks'

import {
  useApproveDepositsGasEstimate,
  useDepositGasEstimate,
  useWithdrawGasEstimate
} from 'lib/hooks/Tsunami/PrizePool/useGasEstimates'
import { InfoListItem } from 'lib/components/InfoList'
import { useChainNativeCurrency } from 'lib/hooks/useChainNativeCurrency'

interface EstimatedGasItemProps {
  chainId: number
  gasEstimate: BigNumber
  isFetched: boolean
  gasUsd?: number
  invalidInput?: boolean
}

export const EstimatedGasItem = (props: EstimatedGasItemProps) => {
  const { gasEstimate, gasUsd, isFetched, invalidInput, chainId } = props
  const nativeCurrency = useChainNativeCurrency(chainId)
  const { t } = useTranslation()
  const label = t('networkFees', 'Network fees')

  if (invalidInput) {
    return <InfoListItem dimValue label={label} value='--' />
  }

  if (!isFetched) {
    return (
      <InfoListItem
        dimValue
        label={label}
        value={<ThemedClipSpinner className='my-auto' size={16} />}
      />
    )
  }

  if (!gasEstimate) {
    return <InfoListItem dimValue label={label} value={t('errorEstimating', 'Error estimating')} />
  }

  return (
    <InfoListItem
      dimValue
      label={label}
      value={`($${numberWithCommas(gasUsd)}) ${numberWithCommas(gasEstimate, {
        decimals: '18'
      })} ${nativeCurrency}`}
    />
  )
}

interface EstimatedPrizePoolGasItemProps {
  prizePool: PrizePool
}

interface EstimatedPrizePoolGasItemWithAmountProps extends EstimatedPrizePoolGasItemProps {
  amountUnformatted: BigNumber
}

const SIMPLE_PRICES_CHAIN_ID_MAP = {
  1: 'matic-network',
  4: 'ethereum',
  137: 'matic-network',
  80001: 'matic-network'
}

// Actual deposit gas used in Wei: 204527
const DEPOSIT_GAS_AMOUNT = BigNumber.from('19012830912830000')

export const EstimatedDepositGasItem = (props: EstimatedPrizePoolGasItemWithAmountProps) => {
  const { prizePool, amountUnformatted } = props
  // const { data: gasEstimate, isFetched } = useDepositGasEstimate(prizePool, amountUnformatted)
  const isFetched = true
  const gasEstimate = DEPOSIT_GAS_AMOUNT

  const { data: prices, isFetched: pricesIsFetched } = useCoingeckoSimplePrices()

  /* TODO: Convert this to a hook */
  let gasUsd
  if (pricesIsFetched) {
    const { usd } = prices[SIMPLE_PRICES_CHAIN_ID_MAP[prizePool.chainId]]
    gasUsd = (DEPOSIT_GAS_AMOUNT.div(parseUnits('1', 9)).toNumber() * usd) / 1000000000
    /* TODO: Multiply by the standard or fast gwei gas amounts from some gas API service */
  }

  return (
    <EstimatedGasItem
      gasUsd={gasUsd}
      chainId={prizePool.chainId}
      invalidInput={false}
      // invalidInput={!amountUnformatted || amountUnformatted.isZero()}
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

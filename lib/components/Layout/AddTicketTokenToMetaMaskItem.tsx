import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import { useIsWalletMetamask } from '@pooltogether/hooks'
import { SettingsItem } from '@pooltogether/react-components'
import { NETWORK } from '@pooltogether/utilities'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { addTokenToMetaMask } from '../../services/addTokenToMetaMask'

export const AddTicketTokenToMetaMaskItem = () => {
  const { data: prizePool, isFetched: isSelectedNetworkFetched } = useSelectedNetworkPrizePool()
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)
  const { wallet } = useOnboard()
  const isMetaMask = useIsWalletMetamask(wallet)

  const { t } = useTranslation()

  if (!isMetaMask || !isSelectedNetworkFetched || !isPrizePoolTokensFetched) {
    return null
  }

  const handleAddTokenToMetaMask = (e) => {
    e.preventDefault()
    addTokenToMetaMask(
      t,
      prizePoolTokens.ticket.symbol,
      prizePoolTokens.ticket.address,
      Number(prizePoolTokens.ticket.decimals)
    )
  }

  return (
    <SettingsItem label={t('addTicketToMetaMask', 'Add to Ticket MetaMask')}>
      <button
        onClick={handleAddTokenToMetaMask}
        className={`trans hover:opacity-70 inline-flex cursor-pointer items-center`}
      >
        {t('addTicketTokenToMetamask', {
          token: prizePoolTokens.ticket.symbol
        })}
      </button>
    </SettingsItem>
  )
}

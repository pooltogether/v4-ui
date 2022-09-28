import { InfoListItem } from '@components/InfoList'
import { PrizePoolLabelFlat } from '@components/PrizePoolLabel'
import { RevokeAllowanceButton } from '@components/RevokeAllowanceButton'
import { TransparentDiv } from '@components/TransparentDiv'
import { usePrizePoolTicketTwabTotalSupply } from '@hooks/v4/PrizePool/usePrizePoolTicketTwabTotalSupply'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { usePrizePoolTicketTotalSupply } from '@hooks/v4/TwabRewards/usePrizePoolTicketTotalSupply'
import { Button, TokenIcon, ViewProps } from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { PrizePool } from '@pooltogether/v4-client-js'
import {
  BlockExplorerLink,
  useIsWalletMetamask,
  useIsWalletOnChainId
} from '@pooltogether/wallet-connection'
import { addTokenToMetamask } from '@utils/addTokenToMetamask'
import FeatherIcon from 'feather-icons-react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

export const PrizePoolInfoView: React.FC<{} & ViewProps> = (props) => {
  const prizePool = useSelectedPrizePool()
  const { t } = useTranslation()

  const isWalletMetaMask = useIsWalletMetamask()
  const isWalletOnProperNetwork = useIsWalletOnChainId(prizePool.chainId)
  const { data: tokenData } = usePrizePoolTokens(prizePool)

  const handleAddTokenToMetaMask = async () => {
    if (!tokenData?.ticket) {
      return
    }

    if (!isWalletOnProperNetwork) {
      toast.warn(
        t?.('switchToNetworkToAddToken', {
          networkName: getNetworkNiceNameByChainId(prizePool.chainId),
          token: tokenData.token.symbol
        }) ||
          `Switch your wallet's network to ${getNetworkNiceNameByChainId(
            prizePool.chainId
          )} to add token '${tokenData.token.symbol}'`
      )
      return null
    }

    addTokenToMetamask(
      tokenData.token.symbol,
      tokenData.token.address,
      Number(tokenData.token.decimals),
      'https://pooltogether.com/ptausdc@2x.png'
    )
  }

  return (
    <div>
      <div className='flex flex-col space-y-4'>
        <PrizePoolLabelFlat prizePool={prizePool} className='mx-auto' />
        <TransparentDiv className='rounded-lg p-4 flex flex-col space-y-2'>
          <PoolStats prizePool={prizePool} />
          <hr />
          <AddressList prizePool={prizePool} />
        </TransparentDiv>
        {isWalletMetaMask && (
          <Button
            onClick={handleAddTokenToMetaMask}
            className='flex w-full items-center justify-center'
          >
            <FeatherIcon icon='plus-circle' className='w-5 h-5 mr-1' />{' '}
            {t?.('addTicketTokenToMetamask', {
              token: tokenData?.token.symbol
            }) || `Add ${tokenData?.token.symbol} to MetaMask`}
          </Button>
        )}

        <RevokeAllowanceButton
          token={tokenData?.token}
          prizePoolAddress={prizePool.address}
          chainId={prizePool.chainId}
        />
      </div>
    </div>
  )
}

const AddressList: React.FC<{ prizePool: PrizePool }> = (props) => {
  const { prizePool } = props

  const { data: tokenData } = usePrizePoolTokens(prizePool)

  const contractLinks = [
    {
      i18nKey: 'prizePool',
      chainId: prizePool.chainId,
      address: prizePool.address
    },
    {
      i18nKey: 'ticket',
      chainId: prizePool.chainId,
      address: tokenData?.ticket.address
    },
    {
      i18nKey: 'depositToken',
      chainId: prizePool.chainId,
      address: tokenData?.token.address
    }
  ]

  return (
    <ul>
      {contractLinks.map((contractLink) => (
        <LinkToContractItem {...contractLink} key={`contract-link-${contractLink.i18nKey}`} />
      ))}
    </ul>
  )
}

const PoolStats: React.FC<{ prizePool: PrizePool }> = (props) => {
  const { prizePool } = props
  const { data: tokenData } = usePrizePoolTokens(prizePool)
  const { data: prizePoolTicketTotalSupply } = usePrizePoolTicketTotalSupply(prizePool)
  const { data: prizePoolTicketTwabTotalSupply } = usePrizePoolTicketTwabTotalSupply(prizePool)

  return (
    <ul>
      <InfoListItem
        label={'TVL'}
        value={
          <div className='flex space-x-1 items-center'>
            <span>{prizePoolTicketTotalSupply?.amount.amountPretty}</span>
            <TokenIcon
              chainId={prizePool.chainId}
              address={tokenData?.token.address}
              sizeClassName='w-4 h-4'
            />
          </div>
        }
      />
      <InfoListItem
        label={'Active Tickets'}
        value={
          <div className='flex space-x-1 items-center'>
            <span>{prizePoolTicketTwabTotalSupply?.amount.amountPretty}</span>
            <TokenIcon
              chainId={prizePool.chainId}
              address={tokenData?.ticket.address}
              sizeClassName='w-4 h-4'
            />
          </div>
        }
      />
    </ul>
  )
}

const LinkToContractItem: React.FC<{ chainId: number; i18nKey: string; address: string }> = (
  props
) => {
  const { chainId, i18nKey, address } = props
  const { t } = useTranslation()

  return (
    <InfoListItem
      label={t(i18nKey) || i18nKey}
      value={
        <BlockExplorerLink
          shorten
          chainId={chainId}
          address={address}
          className='text-xxs xs:text-xs'
        />
      }
    />
  )
}

import FeatherIcon from 'feather-icons-react'
import {
  addTokenToMetamask,
  BlockExplorerLink,
  poolToast,
  SquareButton
} from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { Token, useTransaction } from '@pooltogether/hooks'
import { ModalTitle } from 'lib/components/Modal/ModalTitle'
import { useTranslation } from 'react-i18next'
import { BackButton, ManageSheetViews, ViewProps } from '.'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { useIsWalletMetamask } from 'lib/hooks/useIsWalletMetamask'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { BigNumber } from 'ethers'
import { useUsersDepositAllowance } from 'lib/hooks/Tsunami/PrizePool/useUsersDepositAllowance'
import { useState } from 'react'
import { useSelectedChainIdUser } from 'lib/hooks/Tsunami/User/useSelectedChainIdUser'
import { PrizePool } from '@pooltogether/v4-js-client'

const TOKEN_IMG_URL = {
  PTaUSDC: 'https://app.pooltogether.com/ptausdc@2x.png'
}

export const MoreView = (props: ViewProps) => {
  const { prizePool, balances, setView } = props
  const { t } = useTranslation()
  const { ticket, token } = balances

  const isMetaMask = useIsWalletMetamask()
  const isWalletOnProperNetwork = useIsWalletOnNetwork(prizePool.chainId)

  const handleAddTokenToMetaMask = async () => {
    if (!ticket) {
      return
    }

    if (!isWalletOnProperNetwork) {
      poolToast.warn(
        t('switchToNetworkToAddToken', `Switch to {{networkName}} to add token '{{token}}'`, {
          networkName: getNetworkNiceNameByChainId(prizePool.chainId),
          token: token.symbol
        })
      )
      return null
    }

    addTokenToMetamask(
      ticket.symbol,
      ticket.address,
      Number(ticket.decimals),
      TOKEN_IMG_URL[ticket.symbol]
    )
  }

  return (
    <>
      <ModalTitle
        chainId={prizePool.chainId}
        title={t('depositsOnNetwork', { network: getNetworkNiceNameByChainId(prizePool.chainId) })}
      />
      <ul className='bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 rounded-xl w-full p-4 flex flex-col space-y-1'>
        <div className='opacity-50 font-bold flex justify-between'>
          <span>{t('contract', 'Contract')}</span>
          <span>{t('explorer', 'Explorer')}</span>
        </div>
        <LinkToContractItem
          i18nKey='prizePool'
          chainId={prizePool.chainId}
          address={prizePool.address}
        />
        <LinkToContractItem
          i18nKey='ticketToken'
          chainId={prizePool.chainId}
          address={ticket.address}
        />
        <LinkToContractItem
          i18nKey='depositToken'
          chainId={prizePool.chainId}
          address={token.address}
        />
      </ul>
      {isMetaMask && (
        <SquareButton
          onClick={handleAddTokenToMetaMask}
          className='flex w-full items-center justify-center'
        >
          <FeatherIcon icon='plus-circle' className='w-5 mr-1' />{' '}
          {t('addTicketTokenToMetamask', {
            token: ticket?.symbol
          })}
        </SquareButton>
      )}
      <RevokeAllowanceButton
        isWalletOnProperNetwork={isWalletOnProperNetwork}
        prizePool={prizePool}
        token={token}
      />
      <BackButton onClick={() => setView(ManageSheetViews.main)} />
    </>
  )
}

const LinkToContractItem = (props: { chainId: number; i18nKey: string; address: string }) => {
  const { chainId, i18nKey, address } = props
  const { t } = useTranslation()
  return (
    <li className='w-full flex justify-between'>
      <span className='font-bold'>{t(i18nKey)}</span>
      <BlockExplorerLink shorten chainId={chainId} address={address} />
    </li>
  )
}

interface RevokeAllowanceButtonProps {
  isWalletOnProperNetwork: boolean
  prizePool: PrizePool
  token: Token
}

const RevokeAllowanceButton = (props: RevokeAllowanceButtonProps) => {
  const { isWalletOnProperNetwork, prizePool, token } = props
  const { t } = useTranslation()
  const user = useSelectedChainIdUser()
  const sendTx = useSendTransaction()
  const [approveTxId, setApproveTxId] = useState(0)
  const approveTx = useTransaction(approveTxId)

  const {
    data: depositAllowance,
    refetch: refetchUsersDepositAllowance,
    isFetched
  } = useUsersDepositAllowance(prizePool)

  const handleRevokeAllowanceClick = async () => {
    if (!isWalletOnProperNetwork) {
      poolToast.warn(
        t(
          'switchToNetworkToRevokeToken',
          `Switch to {{networkName}} to revoke '{{token}}' token allowance`,
          {
            networkName: getNetworkNiceNameByChainId(prizePool.chainId),
            token: token.symbol
          }
        )
      )
      return null
    }

    const name = t(`revokePoolAllowance`, { ticker: token.symbol })
    const txId = await sendTx({
      name,
      method: 'approve',
      callTransaction: async () => user.approveDeposits(BigNumber.from(0)),
      callbacks: {
        refetch: () => refetchUsersDepositAllowance()
      }
    })

    setApproveTxId(txId)
  }

  if (!isFetched || depositAllowance.allowanceUnformatted.isZero()) {
    return null
  }

  if (approveTx?.sent && !approveTx?.cancelled) {
    return (
      <div className='bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 rounded-xl w-full p-4 flex'>
        <span>
          {' '}
          {t('revokePoolAllowance', {
            ticker: token?.symbol
          })}
        </span>
        <span>
          <BlockExplorerLink shorten chainId={prizePool.chainId} txHash={approveTx.hash} />
        </span>
      </div>
    )
  }

  return (
    <SquareButton
      onClick={handleRevokeAllowanceClick}
      className='flex w-full items-center justify-center'
    >
      <FeatherIcon icon='minus-circle' className='w-5 mr-1' />{' '}
      {t('revokePoolAllowance', {
        ticker: token?.symbol
      })}
    </SquareButton>
  )
}

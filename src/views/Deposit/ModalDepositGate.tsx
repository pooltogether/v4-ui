import React from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { Token, Amount } from '@pooltogether/hooks'
import {
  formatBlockExplorerTxUrl,
  NetworkIcon,
  SquareLink,
  SquareButton,
  SquareButtonTheme,
  ThemedClipSpinner,
  TokenIcon
} from '@pooltogether/react-components'

import { DepositLowAmountWarning } from '@views/DepositLowAmountWarning'
import { ModalInfoList } from '@components/InfoList'
import { EstimatedDepositGasItems } from '@components/InfoList/EstimatedGasItem'
import { Transaction, TransactionState, TransactionStatus } from '@pooltogether/wallet-connection'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'

interface ModalDepositGateProps {
  token: Token
  amountToDeposit?: Amount
  chainId: number
  approveTx: Transaction
  sendApproveTx: () => void
  className?: string
}

export const ModalDepositGate = (props: ModalDepositGateProps) => {
  const { className, chainId, approveTx, sendApproveTx, amountToDeposit, token } = props

  console.log(token)

  const { t } = useTranslation()

  if (approveTx?.state === TransactionState.pending) {
    const blockExplorerUrl = formatBlockExplorerTxUrl(approveTx.response?.hash, chainId)

    return (
      <>
        <div className='flex flex-col xs:flex-row items-center justify-center xs:justify-between px-4 py-2 text-xs font-bold bg-actually-black bg-opacity-5 dark:bg-white dark:bg-opacity-10 rounded-lg'>
          <span className='uppercase font-averta-bold opacity-40'>
            {t('depositSummary', 'Deposit summary')}
          </span>
          <div className='flex flex-col justify-center xs:justify-start'>
            <div className='flex items-center justify-center xs:ml-2'>
              <TokenIcon chainId={chainId} address={token.address} className='mr-1' />{' '}
              {amountToDeposit.amountPretty} {token.symbol}
            </div>
            <div className='flex items-center justify-center xs:justify-start xs:ml-2'>
              <NetworkIcon chainId={chainId} className='mr-1' />{' '}
              {getNetworkNiceNameByChainId(chainId)}
            </div>
          </div>
        </div>
        <div className={classNames(className, 'flex flex-col pt-4')}>
          <div className='flex'>
            <div className='relative'>
              <div
                className='absolute inset-0 flex justify-center text-lg font-averta-bold border-2 border-pt-purple-lighter rounded-full h-10 w-10 border-opacity-40'
                style={{ paddingTop: 2 }}
              >
                1
              </div>{' '}
              <ThemedClipSpinner className='mx-auto' sizeClassName='w-10 h-10' />
            </div>
            <div
              className='text-inverse mx-4'
              // style={{ paddingTop: 6 }}
            >
              <p className='font-bold'>{t('approveDeposit', 'Approve deposit')}</p>

              <p className='opacity-60 '>
                {t(
                  'youllBeAskedToApproveThisDepositFromWallet',
                  'You will be asked to approve this deposit from your wallet.'
                )}
              </p>
            </div>
          </div>

          <div className='flex items-center mt-4'>
            <div className='relative'>
              <div
                className='absolute inset-0 flex justify-center text-lg font-averta-bold border-2 border-pt-purple-lighter rounded-full h-10 w-10 border-opacity-10'
                style={{ paddingTop: 2 }}
              >
                2
              </div>{' '}
              <div className='mx-auto w-10 h-10' />
            </div>
            <div className='text-inverse mx-4'>
              <p className='font-bold'>{t('confirmDeposit', 'Confirm deposit')}</p>

              {/* <p className='opacity-60 '>
                {t(
                  'youllBeAskedToReviewAndConfirmThisDepositFromWallet',
                  'You will be asked to confirm and approve this deposit from your wallet.'
                )}
              </p> */}
            </div>
          </div>

          {approveTx?.status === TransactionStatus.pendingBlockchainConfirmation && (
            <SquareLink
              href={blockExplorerUrl}
              className='w-full mt-6'
              theme={SquareButtonTheme.tealOutline}
              target='_blank'
            >
              {t('viewReceipt', 'View receipt')}
            </SquareLink>
          )}
        </div>
      </>
    )
  }

  return (
    <div className={classNames(className, 'flex flex-col')}>
      <div className='mx-4 text-inverse opacity-60'>
        <p className='text-xs xs:text-sm mb-2'>
          {t(
            'prizePoolContractsRequireApprovals',
            `PoolTogether's Prize Pool contracts require you to send an approval transaction before depositing.`
          )}
        </p>
        <p className='text-xs xs:text-sm mb-2'>
          {t('thisIsOncePerNetwork', 'This is necessary once per network.')}
        </p>
        <p className='text-xs xs:text-sm mb-4'>
          {t('forMoreInfoOnApprovals', `For more info on approvals see:`)}{' '}
          <a
            target='_blank'
            className='underline'
            href='https://docs.pooltogether.com/pooltogether/using-pooltogether'
          >
            {t('howToDeposit', 'How to deposit')}
          </a>
          .
        </p>
      </div>
      <ModalInfoList className='mb-2'>
        <EstimatedDepositGasItems chainId={chainId} showApprove />
      </ModalInfoList>
      <div className='mb-6'>
        <DepositLowAmountWarning chainId={chainId} amountToDeposit={amountToDeposit} />
      </div>
      <SquareButton className='w-full' onClick={sendApproveTx}>
        {t('confirmApproval', 'Confirm approval')}
      </SquareButton>
    </div>
  )
}

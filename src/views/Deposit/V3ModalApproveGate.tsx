import React from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { Amount } from '@pooltogether/hooks'
import {
  formatBlockExplorerTxUrl,
  ButtonLink,
  Button,
  ButtonTheme,
  ThemedClipSpinner,
  ButtonRadius
} from '@pooltogether/react-components'

import { DepositLowAmountWarning } from '@views/DepositLowAmountWarning'
import { ModalInfoList } from '@components/InfoList'
import { EstimatedDepositGasItems } from '@components/InfoList/EstimatedGasItem'
import { Transaction, TransactionState } from '@pooltogether/wallet-connection'
import { TxButton } from '@components/Input/TxButton'

interface V3ModalApproveGateProps {
  className?: string
  amountToDeposit?: Amount
  chainId: number
  approveTx: Transaction
  sendApproveTx: () => void
  connectWallet?: () => void
}

/**
 * TODO: Make max approval optional
 * @param props
 * @returns
 */
export const V3ModalApproveGate = (props: V3ModalApproveGateProps) => {
  const { className, chainId, approveTx, sendApproveTx, connectWallet, amountToDeposit } = props

  const { t } = useTranslation()

  if (approveTx?.state === TransactionState.pending) {
    const blockExplorerUrl = formatBlockExplorerTxUrl(approveTx.response?.hash, chainId)

    return (
      <div className={classNames(className, 'flex flex-col')}>
        <ThemedClipSpinner className='mx-auto mb-8' sizeClassName='w-10 h-10' />
        <div className='text-inverse opacity-60'>
          <p className='mb-4 text-center mx-8'>
            {t(
              'onceYourApprovalTxHasFinished',
              'Once your approval transaction has finished successfully you can deposit.'
            )}
          </p>
        </div>
        <ButtonLink
          href={blockExplorerUrl}
          className='w-full mt-6'
          theme={ButtonTheme.tealOutline}
          target='_blank'
        >
          {t('viewReceipt', 'View receipt')}
        </ButtonLink>
      </div>
    )
  }

  return (
    <div className={classNames(className, 'flex flex-col')}>
      <div className='mx-4 text-inverse opacity-60'>
        <p className='mb-4'>
          {t(
            'prizePoolContractsRequireApprovals',
            `PoolTogether's Prize Pool contracts require you to send an approval transaction before depositing.`
          )}
        </p>
        <p className='mb-4'>{t('thisIsOncePerNetwork', 'This is necessary once per network.')}</p>
        <p className='mb-10'>
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
      <TxButton
        className='w-full'
        radius={ButtonRadius.full}
        chainId={chainId}
        onClick={sendApproveTx}
        state={approveTx?.state}
        status={approveTx?.status}
        connectWallet={connectWallet}
      >
        {t('confirmApproval', 'Confirm approval')}
      </TxButton>
    </div>
  )
}

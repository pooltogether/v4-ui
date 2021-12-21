import React from 'react'
import Link from 'next/link'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { Transaction } from '@pooltogether/hooks'
import {
  formatBlockExplorerTxUrl,
  SquareLink,
  SquareButton,
  SquareButtonTheme,
  ThemedClipSpinner
} from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-js-client'

import { InfoList, ModalInfoList } from 'lib/components/InfoList'
import { EstimatedApproveDepositsGasItem } from 'lib/components/InfoList/EstimatedGasItem'

interface ModalApproveGateProps {
  className?: string
  prizePool: PrizePool
  chainId: number
  approveTx: Transaction
  sendApproveTx: () => void
}

export const ModalApproveGate = (props: ModalApproveGateProps) => {
  const { prizePool, className, chainId, approveTx, sendApproveTx } = props

  const { t } = useTranslation()

  if (approveTx?.inFlight) {
    const blockExplorerUrl = formatBlockExplorerTxUrl(approveTx?.hash, chainId)

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
        <SquareLink
          href={blockExplorerUrl}
          className='w-full mt-6 text-center'
          theme={SquareButtonTheme.tealOutline}
          target='_blank'
        >
          {t('viewReceipt', 'View receipt')}
        </SquareLink>
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
            href='https://docs.pooltogether.com/how-to/how-to-deposit'
          >
            {t('howToDeposit', 'How to deposit')}
          </a>
          .
        </p>
      </div>
      <ModalInfoList className='mb-6'>
        <EstimatedApproveDepositsGasItem chainId={prizePool.chainId} />
      </ModalInfoList>
      <SquareButton className='w-full' onClick={sendApproveTx}>
        {t('confirmApproval', 'Confirm approval')}
      </SquareButton>
    </div>
  )
}

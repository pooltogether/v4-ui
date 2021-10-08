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

import { InfoList } from 'lib/components/InfoList'
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
    const blockExplorerUrl = formatBlockExplorerTxUrl(approveTx, chainId)

    return (
      <div className={classNames(className, 'flex flex-col text-accent-1')}>
        <ThemedClipSpinner className='mx-auto mb-8' sizeClassName='w-10 h-10' />
        <p className='mb-4 text-accent-1 text-center mx-8'>
          {t(
            'onceYourApprovalTxHasFinished',
            'Once your approval transaction has finished successfully you can deposit.'
          )}
        </p>
        <SquareLink
          Link={Link}
          href={blockExplorerUrl}
          className='w-full mt-6'
          theme={SquareButtonTheme.purple}
          target='_blank'
        >
          {t('viewOnExplorer', 'View on Explorer')}
        </SquareLink>
      </div>
    )
  }

  return (
    <div className={classNames(className, 'flex flex-col')}>
      <div className='mx-4 text-accent-1'>
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
            className='underline'
            href='https://docs.pooltogether.com/how-to/deposit-with-metamask'
          >
            {t('howToDeposit', 'How to deposit')}
          </a>
          .
        </p>
      </div>
      <InfoList className='mb-6'>
        <EstimatedApproveDepositsGasItem prizePool={prizePool} />
      </InfoList>
      <SquareButton className='w-full' onClick={sendApproveTx}>
        {t('confirmApproval', 'Confirm approval')}
      </SquareButton>
    </div>
  )
}

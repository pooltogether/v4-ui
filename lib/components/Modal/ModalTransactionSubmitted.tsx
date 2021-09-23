import { Transaction } from '.yalc/@pooltogether/hooks/dist'
import {
  formatBlockExplorerTxUrl,
  SquareButton,
  SquareButtonTheme
} from '.yalc/@pooltogether/react-components/dist'
import ClipBoardCheckSvg from 'assets/images/icon-clipboard-check.svg'
import classNames from 'classnames'
import Link from 'next/link'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface ModalTransactionSubmittedProps {
  className?: string
  chainId: number
  tx: Transaction
}

export const ModalTransactionSubmitted = (props: ModalTransactionSubmittedProps) => {
  const { chainId, tx, className } = props
  const { t } = useTranslation()

  const url = formatBlockExplorerTxUrl(tx?.hash, chainId)

  return (
    <div className={classNames('flex flex-col', className)}>
      <ClipBoardCheck />
      <span className='text-xxs text-accent-1 mb-8 mx-auto'>{t('ModalTransactionSubmitted')}</span>
      <Link href={url}>
        <a className='w-full' target='_blank' rel='noreferrer'>
          <SquareButton className='w-full' theme={SquareButtonTheme.purpleOutline}>
            {t('viewReceipt', 'View receipt')}
          </SquareButton>
        </a>
      </Link>
    </div>
  )
}

const ClipBoardCheck = () => (
  <img src={ClipBoardCheckSvg} alt='check mark icon' width={64} className='mx-auto mb-6' />
)

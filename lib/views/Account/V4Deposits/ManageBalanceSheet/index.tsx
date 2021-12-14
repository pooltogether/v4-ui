import FeatherIcon from 'feather-icons-react'
import { PrizePool } from '@pooltogether/v4-js-client'
import { BottomSheet } from 'lib/components/BottomSheet'
import { UsersPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MainView } from './MainView'
import { MoreView } from './MoreView'
import { WithdrawView } from './WithdrawView'
import { useTransaction } from '@pooltogether/hooks'

interface ManageBalanceSheetProps {
  open: boolean
  onDismiss: () => void
  balances: UsersPrizePoolBalances
  prizePool: PrizePool
}

export enum ManageSheetViews {
  'main',
  'withdraw',
  'more'
}

export const ManageBalanceSheet = (props: ManageBalanceSheetProps) => {
  const { open, onDismiss, prizePool } = props

  const [selectedView, setView] = useState<ManageSheetViews>(ManageSheetViews.main)
  const [withdrawTxId, setWithdrawTxId] = useState(0)
  const withdrawTx = useTransaction(withdrawTxId)

  let view
  switch (selectedView) {
    case ManageSheetViews.main:
      view = <MainView {...props} withdrawTx={withdrawTx} setView={setView} />
      break
    case ManageSheetViews.more:
      view = <MoreView {...props} setView={setView} />
      break
    case ManageSheetViews.withdraw:
      view = (
        <WithdrawView
          {...props}
          setWithdrawTxId={setWithdrawTxId}
          withdrawTx={withdrawTx}
          setView={setView}
        />
      )
      break
  }

  return (
    <BottomSheet
      open={open}
      onDismiss={onDismiss}
      label={`Manage deposits for ${prizePool.id()}`}
      className='space-y-4'
    >
      {view}
    </BottomSheet>
  )
}

export const BackButton = (props: { onClick: () => void }) => {
  const { t } = useTranslation()
  return (
    <button
      onClick={props.onClick}
      className='font-bold text-lg absolute top-1 left-4 flex opacity-50 hover:opacity-100 transition-opacity'
    >
      <FeatherIcon icon='chevron-left' className='my-auto h-6 w-6' />
      {t('back')}
    </button>
  )
}

export interface ViewProps {
  balances: UsersPrizePoolBalances
  prizePool: PrizePool
  setView: (view: ManageSheetViews) => void
}

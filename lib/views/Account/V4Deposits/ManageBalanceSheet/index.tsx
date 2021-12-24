import React, { useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import { useTransaction } from '@pooltogether/hooks'
import { PrizePool } from '@pooltogether/v4-js-client'
import { useTranslation } from 'react-i18next'
import { BigNumber } from 'ethers'

import { BottomSheet } from 'lib/components/BottomSheet'
import { UsersPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { useSelectedChainIdUser } from 'lib/hooks/Tsunami/User/useSelectedChainIdUser'
import { useUsersDepositAllowance } from 'lib/hooks/Tsunami/PrizePool/useUsersDepositAllowance'
import { MainView } from './MainView'
import { MoreView } from './MoreView'
import { WithdrawView } from './WithdrawView'

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

  const user = useSelectedChainIdUser()
  const {
    data: depositAllowance,
    refetch: refetchUsersDepositAllowance,
    isFetched
  } = useUsersDepositAllowance(prizePool)
  const callTransaction = async () => user.approveDeposits(BigNumber.from(0))
  const refetch = () => refetchUsersDepositAllowance()

  let view
  switch (selectedView) {
    case ManageSheetViews.main:
      view = <MainView {...props} withdrawTx={withdrawTx} setView={setView} />
      break
    case ManageSheetViews.more:
      view = (
        <MoreView
          {...props}
          chainId={prizePool.chainId}
          prizePool={prizePool}
          setView={setView}
          depositAllowance={depositAllowance}
          isFetched={isFetched}
          callTransaction={callTransaction}
          refetch={refetch}
        />
      )
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

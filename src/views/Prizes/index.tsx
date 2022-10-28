import { PagePadding } from '@components/Layout/PagePadding'
import { SelectAppChainIdModal } from '@components/SelectAppChainIdModal'
import { CardTitle } from '@components/Text/CardTitle'
import { URL_QUERY_KEY } from '@constants/urlQueryKeys'
import { useQueryParamState } from '@hooks/useQueryParamState'
import { useLockedDrawIdsWatcher } from '@hooks/v4/PrizeDistributor/useLockedDrawIdsWatcher'
import { usePrizeDistributorBySelectedChainId } from '@hooks/v4/PrizeDistributor/usePrizeDistributorBySelectedChainId'
import { usePrizePoolTokens } from '@hooks/v4/PrizePool/usePrizePoolTokens'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { usePrizePageState } from '@hooks/v4/usePrizePageState'
import { Tabs } from '@pooltogether/react-components'
import { PrizeDistributor, PrizePool } from '@pooltogether/v4-client-js'
import { useUsersAddress } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { HistoricDraws } from './HistoricDraws'
import { LastDrawWinners } from './LastDrawWinners'
import { MultiDrawsCard } from './MultiDrawsCard'
import { LockedDrawsCard } from './MultiDrawsCard/LockedDrawsCard'
import { PrizeHeader } from './PrizeHeader'

export const PRIZE_UI_STATES = {
  initialState: 'initialState',
  checkingForPrizes: 'checkingForPrizes',
  won: 'won',
  didNotWin: 'didNotWin'
}

export const PrizesUI = () => {
  useLockedDrawIdsWatcher()
  const { t } = useTranslation()
  const prizeDistributor = usePrizeDistributorBySelectedChainId()
  const prizePool = useSelectedPrizePool()
  const usersAddress = useUsersAddress()
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)
  const {
    state: prizePageState,
    checkedState,
    setCheckedState
  } = usePrizePageState(usersAddress, prizeDistributor)
  const { data: initialTabId, setData } = useQueryParamState(URL_QUERY_KEY.prizeView, 'last_draw', [
    'last_draw',
    'history'
  ])

  if (!Boolean(prizeDistributor) || !prizePool || !isPrizePoolTokensFetched) {
    return null
  }

  return (
    <PagePadding>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16 lg:mb-28'>
        <PrizeHeader
          className='hidden sm:flex'
          prizeDistributor={prizeDistributor}
          usersAddress={usersAddress}
          prizePageState={prizePageState}
          checkedState={checkedState}
        />
        <div className='w-full'>
          <div className='max-w-screen-xs space-y-4 mx-auto sm:ml-auto'>
            <CheckForPrizesOnNetwork prizePool={prizePool} prizeDistributor={prizeDistributor} />
            {!usersAddress ? (
              <LockedDrawsCard
                prizeDistributor={prizeDistributor}
                token={prizePoolTokens?.token}
                ticket={prizePoolTokens?.ticket}
              />
            ) : (
              <MultiDrawsCard
                prizePool={prizePool}
                prizeDistributor={prizeDistributor}
                checkedState={checkedState}
                setCheckedState={setCheckedState}
              />
            )}
          </div>
        </div>
      </div>
      <div className='max-w-screen-xs sm:max-w-screen-md mx-auto'>
        <Tabs
          titleClassName='mb-8 px-2 sm:px-6'
          initialTabId={initialTabId}
          onTabSelect={(tab) => setData(tab.id)}
          tabs={[
            {
              id: 'last_draw',
              view: <LastDrawWinners />,
              title: t('lastDraw')
            },
            {
              id: 'history',
              view: <HistoricDraws />,
              title: t('drawHistory')
            }
          ]}
        />
      </div>
    </PagePadding>
  )
}

const CheckForPrizesOnNetwork = (props: {
  className?: string
  prizePool: PrizePool
  prizeDistributor: PrizeDistributor
}) => {
  const { className } = props
  const { t } = useTranslation()
  return (
    <div
      className={classNames('font-semibold flex flex-col space-y-2 text-xs xs:text-sm', className)}
    >
      <CardTitle title={t('prizesForPrizePool')} className='px-2 sm:px-0' />
      <SelectAppChainIdModal className='network-dropdown' />
    </div>
  )
}

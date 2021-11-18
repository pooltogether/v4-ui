import { PrizeDistributor, PrizePool } from '@pooltogether/v4-js-client'
import { SelectedNetworkDropdown } from 'lib/components/SelectedNetworkDropdown'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { MultiDrawsCard } from '../MultiDrawsCard'

interface PrizeCheckerProps {
  prizePool: PrizePool
  prizeDistributor: PrizeDistributor
}

export const PrizeChecker = (props: PrizeCheckerProps) => {
  const { prizePool, prizeDistributor } = props

  return (
    <div>
      <CheckForPrizesOnNetwork prizePool={prizePool} prizeDistributor={prizeDistributor} />
      <MultiDrawsCard prizePool={prizePool} prizeDistributor={prizeDistributor} />
    </div>
  )
}

const CheckForPrizesOnNetwork = (props: PrizeCheckerProps) => {
  const { prizePool } = props
  const { t } = useTranslation()
  return (
    <div className='font-semibold font-inter flex items-center justify-center text-xs xs:text-sm sm:text-lg mb-6'>
      <span>{t('prizesOn', 'Prizes on')}</span>
      <SelectedNetworkDropdown className='network-dropdown ml-1 xs:ml-2' />
    </div>
  )
}

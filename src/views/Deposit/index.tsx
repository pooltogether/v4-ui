import React from 'react'
import { PrizeApi } from '@pooltogether/v4-client-js'

import { DepositCard } from '@views/Deposit/DepositCard'
import { PagePadding } from '@components/Layout/PagePadding'
import { UpcomingPrizeCard } from './UpcomingPrizeCard'

export const DepositUI = () => {
  return (
    <PagePadding className='flex flex-col space-y-6'>
      <TestApi />
      <UpcomingPrizeCard className='mt-4' />
      <DepositCard />
    </PagePadding>
  )
}

const TestApi = () => {
  return (
    <button
      onClick={() => {
        PrizeApi.getUsersDrawResultsByDraws(
          137,
          '0xe507F2d7dE97c783a60FeF9f1c4A4dade2b0a989',
          '0x8141BcFBcEE654c5dE17C4e2B2AF26B67f9B9056',
          [122],
          2
        )
        PrizeApi.getDrawResultsFromPrizeApi(
          137,
          '0xe507F2d7dE97c783a60FeF9f1c4A4dade2b0a989',
          '0x8141BcFBcEE654c5dE17C4e2B2AF26B67f9B9056',
          122,
          2
        )
        PrizeApi.calculateDrawResults(
          137,
          '0xe507F2d7dE97c783a60FeF9f1c4A4dade2b0a989',
          '0x8141BcFBcEE654c5dE17C4e2B2AF26B67f9B9056',
          122
        )
        PrizeApi.calculateDrawResultsOnCloudFlareWorker(
          137,
          '0xe507F2d7dE97c783a60FeF9f1c4A4dade2b0a989',
          '0x8141BcFBcEE654c5dE17C4e2B2AF26B67f9B9056',
          122
        )
      }}
    >
      Test
    </button>
  )
}

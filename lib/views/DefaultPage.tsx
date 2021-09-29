import React from 'react'
import classnames from 'classnames'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { Content, ContentPane, LoadingDots } from '@pooltogether/react-components'
import { AccountUI } from 'lib/views/Account'
import { PrizesUI } from 'lib/views/Prizes'
import { useSelectedNetworkPlayer } from 'lib/hooks/Tsunami/Player/useSelectedNetworkPlayer'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { URL_QUERY_KEY } from 'lib/constants/urlQueryKeys'
import { DepositUI } from 'lib/views/Deposit'
import { Navigation } from 'lib/components/Navigation'

export enum ContentPaneState {
  deposit = 'deposit',
  prizes = 'prizes',
  account = 'account'
}

export const DefaultPage = () => {
  const router = useRouter()

  useSelectedNetworkPlayer()
  const { data: prizePool, isFetched: isPrizePoolFetched } = useSelectedNetworkPrizePool()
  const { isFetched: isPrizePoolTokensFetched } = usePrizePoolTokens(prizePool)

  const setSelectedPage = (newTab: ContentPaneState) => {
    const { query, pathname } = router
    query[URL_QUERY_KEY.tab] = newTab
    router.replace({ pathname, query })
  }
  const selected = router.query[URL_QUERY_KEY.tab] || ContentPaneState.deposit

  const depositSelected = selected === ContentPaneState.deposit
  const prizesSelected = selected === ContentPaneState.prizes
  const accountSelected = selected === ContentPaneState.account

  const selectedProps = { depositSelected, prizesSelected, accountSelected }

  if (!isPrizePoolFetched || !isPrizePoolTokensFetched) {
    return (
      <div className='w-full h-full flex'>
        <LoadingDots className='m-auto' />
      </div>
    )
  }

  return (
    <>
      <Navigation {...selectedProps} setSelectedPage={setSelectedPage} className='mx-auto mb-6' />
      <div className='max-w-xl mx-auto'>
        <ContentPanes {...selectedProps} setSelectedPage={setSelectedPage} />
      </div>
    </>
  )
}

export interface ContentPanesProps {
  depositSelected: boolean
  prizesSelected: boolean
  accountSelected: boolean
  setSelectedPage: (page: ContentPaneState) => void
}

const ContentPanes = (props: ContentPanesProps) => {
  const { depositSelected, prizesSelected, accountSelected } = props

  return (
    <>
      <FullWidthContentPane isSelected={depositSelected}>
        <Content>
          <DepositUI {...props} />
        </Content>
      </FullWidthContentPane>
      <FullWidthContentPane isSelected={prizesSelected}>
        <Content>
          <PrizesUI {...props} />
        </Content>
      </FullWidthContentPane>
      <FullWidthContentPane isSelected={accountSelected}>
        <Content>
          <AccountUI {...props} />
        </Content>
      </FullWidthContentPane>
    </>
  )
}

const FullWidthContentPane = (props) => <ContentPane {...props} className={'w-full'} />

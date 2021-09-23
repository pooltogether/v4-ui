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
      <NavTabs {...selectedProps} setSelectedPage={setSelectedPage} className='mx-auto mb-6' />
      <div className='max-w-xl mx-auto'>
        <ContentPanes {...selectedProps} setSelectedPage={setSelectedPage} />
      </div>
    </>
  )
}

const NavTabs = (props) => {
  const { t } = useTranslation()
  const { className, depositSelected, prizesSelected, accountSelected, setSelectedPage } = props

  return (
    <nav className={classnames(className, 'max-w-max flex flex-row rounded bg-darkened px-2 py-1')}>
      <NavTab
        setSelectedPage={setSelectedPage}
        page={ContentPaneState.deposit}
        isSelected={depositSelected}
      >
        {t('deposit')}
      </NavTab>
      <NavTab
        setSelectedPage={setSelectedPage}
        page={ContentPaneState.prizes}
        isSelected={prizesSelected}
      >
        {t('prizes')}
      </NavTab>
      <NavTab
        setSelectedPage={setSelectedPage}
        page={ContentPaneState.account}
        isSelected={accountSelected}
      >
        {t('account')}
      </NavTab>
    </nav>
  )
}

const NavTab = (props) => {
  const { setSelectedPage, page, isSelected, ...buttonProps } = props
  return (
    <a
      {...buttonProps}
      className={classnames(
        'transition mx-1 first:ml-0 last:mr-0 rounded px-2 flex flex-row hover:bg-light-purple-10 active:bg-tertiary',
        { 'bg-tertiary': isSelected }
      )}
      onClick={() => setSelectedPage(page)}
    />
  )
}

const CONTENT_PANE_CLASSNAME = 'pt-4 w-full'

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
      <ContentPane className={CONTENT_PANE_CLASSNAME} isSelected={depositSelected}>
        <Content>
          <DepositUI {...props} />
        </Content>
      </ContentPane>
      <ContentPane className={CONTENT_PANE_CLASSNAME} isSelected={prizesSelected}>
        <Content>
          <PrizesUI {...props} />
        </Content>
      </ContentPane>
      <ContentPane className={CONTENT_PANE_CLASSNAME} isSelected={accountSelected}>
        <Content>
          <AccountUI {...props} />
        </Content>
      </ContentPane>
    </>
  )
}

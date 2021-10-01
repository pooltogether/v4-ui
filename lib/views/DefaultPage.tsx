import React from 'react'
import { Content, ContentPane, LoadingDots } from '@pooltogether/react-components'
import { AccountUI } from 'lib/views/Account'
import { PrizesUI } from 'lib/views/Prizes'
import { useSelectedNetworkPlayer } from 'lib/hooks/Tsunami/Player/useSelectedNetworkPlayer'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { DepositUI } from 'lib/views/Deposit'
import { useSelectedPage } from 'lib/hooks/useSelectedPage'

export const DefaultPage = () => {
  const selectedPageProps = useSelectedPage()

  useSelectedNetworkPlayer()
  const { data: prizePool, isFetched: isPrizePoolFetched } = useSelectedNetworkPrizePool()
  const { isFetched: isPrizePoolTokensFetched } = usePrizePoolTokens(prizePool)

  if (!isPrizePoolFetched || !isPrizePoolTokensFetched) {
    return (
      <div className='w-full h-full flex'>
        <LoadingDots className='m-auto' />
      </div>
    )
  }

  return (
    <div className='max-w-xl mx-auto'>
      <ContentPanes {...selectedPageProps} />
    </div>
  )
}

export interface ContentPanesProps {
  depositSelected: boolean
  prizesSelected: boolean
  accountSelected: boolean
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

import React, { useState } from 'react'
import { ethers } from 'ethers'
import { useTranslation } from 'react-i18next'
import { PrizeCountdown, Tabs, Tab, Content, ContentPane } from '@pooltogether/react-components'

const bn = ethers.BigNumber.from

const CONTENT_PANE_STATES = {
  deposit: 'deposit',
  prizes: 'prizes',
  holdings: 'holdings'
}

const TAB_CLASS_NAMES = 'mx-4 px-10 py-2 bg-card rounded-full border'
const TAB_DESELECTED_CLASS_NAMES =
  'text-accent-1 hover:text-inverse border-transparent hover:border-highlight-2 hover:bg-card-selected'
const TAB_SELECTED_CLASS_NAMES = 'text-accent-3 border-default bg-card-selected'

export const DefaultPage = (props) => {
  const [selected, setSelected] = useState(CONTENT_PANE_STATES.deposit)

  const depositSelected = selected === CONTENT_PANE_STATES.deposit
  const prizesSelected = selected === CONTENT_PANE_STATES.prizes
  const holdingsSelected = selected === CONTENT_PANE_STATES.holdings

  const defaultTabProps = {
    tabDeselectedClassName: TAB_DESELECTED_CLASS_NAMES,
    tabSelectedClassName: TAB_SELECTED_CLASS_NAMES,
    className: TAB_CLASS_NAMES
  }

  return (
    <div className='flex flex-col items-center'>
      <Tabs>
        <Tab
          {...defaultTabProps}
          onClick={() => {
            setSelected(CONTENT_PANE_STATES.deposit)
          }}
          isSelected={depositSelected}
        >
          deposit
        </Tab>
        <Tab
          {...defaultTabProps}
          onClick={() => {
            setSelected(CONTENT_PANE_STATES.prizes)
          }}
          isSelected={prizesSelected}
        >
          prizes
        </Tab>
        <Tab
          {...defaultTabProps}
          onClick={() => {
            setSelected(CONTENT_PANE_STATES.holdings)
          }}
          isSelected={holdingsSelected}
        >
          holdings
        </Tab>
      </Tabs>
      <ContentPane className='w-full' isSelected={depositSelected}>
        <Content>
          <DepositUI />
        </Content>
      </ContentPane>
      <ContentPane isSelected={prizesSelected}>
        <Content>
          <PrizesUI />
        </Content>
      </ContentPane>
      <ContentPane isSelected={holdingsSelected}>
        <Content>
          <HoldingsUI />
        </Content>
      </ContentPane>
    </div>
  )
}

const DepositUI = (props) => {
  return (
    <div className='my-4 flex flex-col w-full'>
      <UpcomingPrizeDetails />
      <DepositSwap />
      <PrizeBreakdown />
    </div>
  )
}

const PrizesUI = (props) => {
  return <>prizes</>
}

const HoldingsUI = (props) => {
  return <>holdings</>
}

const UpcomingPrizeDetails = (props) => {
  const { t } = useTranslation()

  return (
    <>
      <div className='bg-secondary rounded-lg w-full p-10 flex flex-col items-center'>
        <h6 className='uppercase'>{t('weeklyPrize')}</h6>
        <h1>$100,000.23</h1>
        <h6>{t('awardIn')}</h6>
        <h6>
          <PrizeCountdown prizePeriodSeconds={bn(86400)} prizePeriodStartedAt={bn(1627514627)} />
        </h6>
      </div>
    </>
  )
}

const DepositSwap = (props) => {
  return <>swap</>
}

const PrizeBreakdown = (props) => {
  return <>break it down</>
}

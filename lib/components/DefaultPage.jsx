import React, { useState } from 'react'
import { ethers } from 'ethers'
import { useTranslation } from 'react-i18next'
import { PrizeCountdown, Tabs, Tab, Content, ContentPane } from '@pooltogether/react-components'

import { DepositAmount } from 'lib/components/DepositAmount'

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

const DEFAULT_TAB_PROPS = {
  tabDeselectedClassName: TAB_DESELECTED_CLASS_NAMES,
  tabSelectedClassName: TAB_SELECTED_CLASS_NAMES,
  className: TAB_CLASS_NAMES
}

export const DefaultPage = (props) => {
  const [selected, setSelected] = useState(CONTENT_PANE_STATES.deposit)

  const depositSelected = selected === CONTENT_PANE_STATES.deposit
  const prizesSelected = selected === CONTENT_PANE_STATES.prizes
  const holdingsSelected = selected === CONTENT_PANE_STATES.holdings

  const selectedProps = { depositSelected, prizesSelected, holdingsSelected }

  return (
    <div className='flex flex-col items-center'>
      <NavTabs {...selectedProps} setSelected={setSelected} />
      <ContentPanes {...selectedProps} />
    </div>
  )
}

const NavTabs = (props) => {
  const { depositSelected, prizesSelected, holdingsSelected, setSelected } = props

  return (
    <>
      <Tabs>
        <Tab
          {...DEFAULT_TAB_PROPS}
          onClick={() => {
            setSelected(CONTENT_PANE_STATES.deposit)
          }}
          isSelected={depositSelected}
        >
          deposit
        </Tab>
        <Tab
          {...DEFAULT_TAB_PROPS}
          onClick={() => {
            setSelected(CONTENT_PANE_STATES.prizes)
          }}
          isSelected={prizesSelected}
        >
          prizes
        </Tab>
        <Tab
          {...DEFAULT_TAB_PROPS}
          onClick={() => {
            setSelected(CONTENT_PANE_STATES.holdings)
          }}
          isSelected={holdingsSelected}
        >
          holdings
        </Tab>
      </Tabs>
    </>
  )
}

const ContentPanes = (props) => {
  const { depositSelected, prizesSelected, holdingsSelected } = props

  return (
    <>
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
    </>
  )
}

const DepositUI = (props) => {
  return (
    <div className='mx-auto my-4 flex flex-col w-full sm:max-w-3xl'>
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
        <div className='font-inter uppercase text-accent-1'>{t('weeklyPrize')}</div>
        <div className='font-bold text-9xl'>$100,000.23</div>
        <div className='font-inter text-accent-1 my-4'>{t('awardIn')}</div>
        <PrizeCountdown
          textSize='text-xl'
          prizePeriodSeconds={bn(86400)}
          prizePeriodStartedAt={bn(1627514627)}
        />
      </div>
    </>
  )
}

const DepositSwap = (props) => {
  return (
    <>
      <div className='w-full p-10 flex flex-col items-center'>
        {/* <DepositAmount
          {...DepositAmountProps}
          nextStep={nextStep}
          key={0}
          tokenAddress={tokenAddress}
          contractAddress={contractAddress}
          quantity={quantity}
          prevTicketBalance={prevTicketBalance}
          prevUnderlyingBalance={prevUnderlyingBalance}
          chainId={chainId}
          form={form}
        /> */}
      </div>
    </>
  )
}

const PrizeBreakdown = (props) => {
  return <>break it down</>
}

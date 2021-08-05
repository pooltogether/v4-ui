import React, { useState } from 'react'
import classnames from 'classnames'
import { ethers } from 'ethers'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { NETWORK } from '@pooltogether/utilities'
import {
  useTokenAllowances,
  useTokenBalances,
  useUsersAddress,
  useIsWalletOnNetwork
} from '@pooltogether/hooks'
import { PrizeCountdown, Tabs, Tab, Content, ContentPane } from '@pooltogether/react-components'

import { DepositAmount } from 'lib/components/DepositAmount'

import PrizeWLaurels from 'assets/images/prize-w-laurels@2x.png'

const bn = ethers.BigNumber.from

const MOCK_POOL = {
  config: { chainId: NETWORK.rinkeby },
  prizePool: { address: '0x4706856fa8bb747d50b4ef8547fe51ab5edc4ac2' },
  tokens: {
    ticket: {
      decimals: 18,
      address: '0x4fb19557fbd8d73ac884efbe291626fd5641c778'
    },
    underlyingToken: {
      decimals: 18,
      address: '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea'
    }
  }
}

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
      <Tabs className='mb-4'>
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
    <div className='mx-auto my-4 flex flex-col w-full max-w-xl'>
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
      <div className='bg-card hover:bg-secondary trans rounded-lg w-full p-10 flex flex-col mb-4 items-center'>
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
  const { t } = useTranslation()

  const contractAddress = MOCK_POOL?.prizePool?.address
  const chainId = MOCK_POOL?.config?.chainId
  const underlyingToken = MOCK_POOL?.tokens?.underlyingToken
  const tokenAddress = underlyingToken.address
  const ticketAddress = MOCK_POOL?.tokens?.ticket.address

  const quantity = '2'
  const prevTicketBalance = '20'
  const prevUnderlyingBalance = '40'

  const walletOnWrongNetwork = useIsWalletOnNetwork(chainId)

  const usersAddress = useUsersAddress()
  const { data: tokenBalances, isFetched: isTokenBalancesFetched } = useTokenBalances(
    chainId,
    usersAddress,
    [tokenAddress, ticketAddress]
  )

  const form = useForm({
    mode: 'all',
    reValidateMode: 'onChange'
  })

  const {
    data: tokenAllowances,
    isFetched: tokenAllowancesIsFetched,
    refetch: tokenAllowancesRefetch
  } = useTokenAllowances(chainId, usersAddress, contractAddress, [tokenAddress])

  return (
    <>
      <div className='relative bg-card rounded-lg w-full flex flex-col items-center mb-4 p-10'>
        <div
          className={classnames(
            'rounded-lg bg-overlay w-full h-full absolute t-0 b-0 l-0 r-0 z-20 trans bg-blur flex items-center justify-center p-20 text-center',
            {
              'opacity-0 pointer-events-none': walletOnWrongNetwork
            }
          )}
          style={{
            textShadow: '2px 2px 20px black'
          }}
        >
          <div className='text-lg -mt-10'>
            {t(
              'tsunamiWrongNetworkMsg',
              `To use Tsunami please set your wallet's network to Rinkeby`
            )}
          </div>
        </div>

        <DepositAmount
          key={0}
          underlyingToken={underlyingToken}
          tokenAddress={tokenAddress}
          tokenSymbol={tokenBalances?.[tokenAddress].symbol}
          usersTicketBalance={tokenBalances?.[ticketAddress].amount}
          usersUnderlyingBalance={tokenBalances?.[tokenAddress].amount}
          usersTokenAllowance={tokenAllowances?.[tokenAddress]?.allowanceUnformatted}
          tokenAllowancesRefetch={tokenAllowancesRefetch}
          tokenAllowancesIsFetched={tokenAllowancesIsFetched}
          contractAddress={contractAddress}
          quantity={quantity}
          prevTicketBalance={prevTicketBalance}
          prevUnderlyingBalance={prevUnderlyingBalance}
          chainId={chainId}
          form={form}
        />
      </div>
    </>
  )
}

const PrizeBreakdown = (props) => {
  const { t } = useTranslation()

  return (
    <>
      <div className='bg-card rounded-lg w-full flex flex-col items-center mb-4 px-20 p-10'>
        <img
          src={PrizeWLaurels}
          alt='trophy icon w/ laurels'
          height={60}
          width={88}
          className='mx-auto'
        />
        <div className='font-inter font-semibold text-sm capitalize text-accent-1 my-3'>
          {t('prizeBreakdown')}
        </div>

        <hr className='border-accent-3' style={{ width: '100%' }} />

        <div className='flex flex-col w-full'>
          <div className='flex justify-between'>
            {/* <PrizeTableHeader>{t('prize')}</PrizeTableHeader> */}
            <PrizeTableHeader widthClasses='w-32'>{t('amount')}</PrizeTableHeader>
            <PrizeTableHeader widthClasses='w-32'>{t('winners')}</PrizeTableHeader>
            <PrizeTableHeader widthClasses='w-24'>{t('odds')}</PrizeTableHeader>
          </div>
          <div className='flex justify-between '>
            {/* <PrizeTableCell>{t('')}</PrizeTableCell> */}
            <PrizeTableCell
              className='font-inter font-bold text-lg capitalize text-accent-1 my-1 w-32'
              isFlashy
            >
              $50,000
            </PrizeTableCell>
            <PrizeTableCell
              className='font-inter font-semibold text-lg capitalize text-accent-1 my-1 w-32'
              isFlashy
            >
              1
            </PrizeTableCell>
            <PrizeTableCell
              className='font-inter font-semibold text-lg capitalize text-accent-1 my-1 w-24'
              isFlashy
            >
              1/50,000
            </PrizeTableCell>
          </div>
          <div className='flex justify-between'>
            {/* <PrizeTableCell>{t('')}</PrizeTableCell> */}
            <PrizeTableCell widthClasses='w-32'>$2,500</PrizeTableCell>
            <PrizeTableCell widthClasses='w-32'>10</PrizeTableCell>
            <PrizeTableCell widthClasses='w-24'>1/1,000</PrizeTableCell>
          </div>
          <div className='flex justify-between '>
            {/* <PrizeTableCell widthClasses='w-32'>{t('')}</PrizeTableCell> */}
            <PrizeTableCell widthClasses='w-32'>$250</PrizeTableCell>
            <PrizeTableCell widthClasses='w-32'>100</PrizeTableCell>
            <PrizeTableCell widthClasses='w-24'>1/100</PrizeTableCell>
          </div>
        </div>
      </div>
    </>
  )
}

const PrizeTableHeader = (props) => {
  return (
    <div
      className={classnames(
        'font-inter text-xxs capitalize text-accent-1 mt-8 mb-2 opacity-60',
        props.widthClasses
      )}
    >
      {props.children}
    </div>
  )
}

const PrizeTableCell = (props) => {
  return (
    <div
      className={classnames(props.className, props.widthClasses, {
        'text-flashy': props.isFlashy
      })}
    >
      {props.children}
    </div>
  )
}

PrizeTableCell.defaultProps = {
  className: 'font-inter text-lg capitalize text-accent-1 my-1 opacity-60'
}

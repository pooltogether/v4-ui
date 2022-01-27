import { Amount, Token, TokenWithBalance, TokenWithUsdBalance } from '@pooltogether/hooks'
import FeatherIcon from 'feather-icons-react'
import { ThemedClipSpinner, TokenIcon } from '@pooltogether/react-components'
import { displayPercentage } from '@pooltogether/utilities'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { VAPRTooltip } from 'lib/components/VAPRTooltip'
import { V3PrizePoolBalances } from 'lib/hooks/v3/useAllUsersV3Balances'
import { StakingBottomSheet } from './StakingBottomSheet'
import classNames from 'classnames'

interface StakingCardProps
  extends StakingCardTitleProps,
    DepositedStateProps,
    NotDepositedStateProps {
  balances: V3PrizePoolBalances
  colorFrom: string
  colorTo: string
  refetch: () => void
}

export const StakingCard = (props: StakingCardProps) => {
  const { balances, colorFrom, colorTo, refetch } = props
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div
        className='rounded-lg p-4 text-white mb-4'
        style={{
          backgroundImage: `linear-gradient(300deg, ${colorFrom} 0%, ${colorTo} 100%)`
        }}
      >
        <StakingCardTitle {...props} />
        {balances.ticket.hasBalance ? (
          <DepositedState {...props} />
        ) : (
          <NotDepositedState {...props} openBottomSheet={() => setIsOpen(true)} />
        )}
      </div>
      <StakingBottomSheet
        chainId={balances.chainId}
        balances={balances}
        isOpen={isOpen}
        underlyingTokenValueUsd={balances.token.usdPerToken}
        setIsOpen={setIsOpen}
        refetch={refetch}
      />
    </>
  )
}

interface StakingCardTitleProps {
  tokenLabel: string
  tokenIcon: React.ReactNode
  poolEmoji: string
}

const StakingCardTitle = (props: StakingCardTitleProps) => {
  const { tokenLabel, tokenIcon, poolEmoji } = props
  const { t } = useTranslation()
  return (
    <div className='flex w-full justify-between mb-4'>
      <div className='flex items-center'>
        {tokenIcon}
        <span className='ml-2 font-semibold text-xl'>
          {t('stake')} {tokenLabel}
        </span>
      </div>
      <div className='text-xl' style={{ textShadow: '2px 2px 0px rgba(50, 10, 100, 0.3)' }}>
        {poolEmoji}
      </div>
    </div>
  )
}

interface DepositedStateProps {
  vapr: number
  chainId: number
  ticket: TokenWithUsdBalance
  tokenFaucetRewards: TokenWithBalance
  isTokenFaucetRewardsFetched: boolean
  isTokenFaucetDataFetched: boolean
  openBottomSheet: () => void
}
const DepositedState = (props: DepositedStateProps) => {
  const {
    chainId,
    ticket,
    tokenFaucetRewards,
    vapr,
    isTokenFaucetDataFetched,
    isTokenFaucetRewardsFetched,
    openBottomSheet
  } = props
  const { t } = useTranslation()
  return (
    <>
      <ul className='rounded-lg bg-pt-purple-darker bg-opacity-20 px-8 py-4 space-y-2'>
        <ListItem
          title={t('deposited')}
          content={<TokenAndAmount chainId={chainId} token={ticket} amount={ticket} />}
        />
        <ListItem
          title={t('rewards')}
          content={
            <TokenAndAmount
              chainId={chainId}
              token={tokenFaucetRewards}
              amount={tokenFaucetRewards}
              isFetched={isTokenFaucetRewardsFetched}
            />
          }
        />
        <ListItem
          title={t('earning')}
          content={
            <TokenAndVAPR
              chainId={chainId}
              token={tokenFaucetRewards}
              vapr={vapr}
              isFetched={isTokenFaucetDataFetched}
            />
          }
        />
      </ul>
      <OpenModalButton onClick={openBottomSheet} label={t('manage')} />
    </>
  )
}

const ListItem = (props: { title: string; content: React.ReactNode }) => {
  return (
    <li className='flex w-full justify-between items-center'>
      <span className='font-bold text-lg'>{props.title}</span>
      {props.content}
    </li>
  )
}

const TokenAndAmount = (props: {
  chainId: number
  token: Token
  amount: Amount
  isFetched?: boolean
}) => (
  <div className='flex space-x-2 font-bold text-lg'>
    <TokenIcon chainId={props.chainId} address={props.token?.address} sizeClassName='w-6 h-6' />
    {props.isFetched ? (
      <>
        <span>{props.amount.amountPretty}</span>
        <span>{props.token.symbol}</span>
      </>
    ) : (
      <ThemedClipSpinner sizeClassName='w-4 h-4 opacity-50' />
    )}
  </div>
)

TokenAndAmount.defaultProps = {
  isFetched: true
}

const TokenAndVAPR = (props: {
  chainId: number
  token: Token
  vapr: number
  isFetched: boolean
}) => (
  <div className='flex space-x-2 font-bold text-lg'>
    <TokenIcon chainId={props.chainId} address={props.token.address} sizeClassName='w-6 h-6' />
    <span>
      {props.isFetched ? (
        `${displayPercentage(String(props.vapr))}%`
      ) : (
        <ThemedClipSpinner sizeClassName='w-4 h-4 opacity-50' />
      )}{' '}
      <VAPRTooltip />
    </span>
  </div>
)

interface NotDepositedStateProps {
  chainId: number
  vapr: number
  depositPrompt: string
  tokenFaucetRewards: TokenWithBalance
  openBottomSheet: () => void
}
const NotDepositedState = (props: NotDepositedStateProps) => {
  const { vapr, depositPrompt, tokenFaucetRewards, chainId, openBottomSheet } = props
  const { t } = useTranslation()
  return (
    <div className='space-y-2 flex flex-col'>
      <p className='text-sm'>{depositPrompt}</p>
      <div className='flex space-x-2 font-bold text-lg items-center'>
        <TokenIcon chainId={chainId} address={tokenFaucetRewards.address} sizeClassName='w-6 h-6' />
        <span>{t('earn')}</span>
        <span>
          {displayPercentage(String(vapr))}% <VAPRTooltip />
        </span>
      </div>
      <OpenModalButton onClick={openBottomSheet} label={t('deposit')} />
    </div>
  )
}

const OpenModalButton = (props: { className?: string; onClick: () => void; label: string }) => (
  <button
    className={classNames(
      props.className,
      'flex items-center transition uppercase font-semibold text-lg opacity-90 hover:opacity-100 rounded-lg bg-pt-purple-darker bg-opacity-20 hover:bg-opacity-10 pl-4'
    )}
    onClick={props.onClick}
  >
    <span>{props.label}</span>
    <FeatherIcon
      icon='chevron-right'
      className='transition w-6 h-6 opacity-50 hover:opacity-100 my-auto ml-1'
    />
  </button>
)

import { Amount, Token, TokenWithBalance, TokenWithUsdBalance } from '@pooltogether/hooks'
import FeatherIcon from 'feather-icons-react'
import { ThemedClipSpinner, TokenIcon } from '@pooltogether/react-components'
import { displayPercentage } from '@pooltogether/utilities'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { VAPRTooltip } from '@components/VAPRTooltip'
import { V3PrizePoolBalances } from '@hooks/v3/useAllUsersV3Balances'
import { StakingBottomSheet } from './StakingBottomSheet'
import classNames from 'classnames'

interface StakingCardProps {
  chainId: number
  balances: V3PrizePoolBalances
  colorFrom: string
  colorTo: string
  tokenLabel: string
  poolEmoji: string
  vapr: number
  tokenFaucetRewards: TokenWithBalance
  tokenIcon: React.ReactNode
  isTokenFaucetRewardsFetched: boolean
  isTokenFaucetDataFetched: boolean
  depositPrompt: string
  refetch: () => void
}

export const StakingCard = (props: StakingCardProps) => {
  const {
    balances,
    colorFrom,
    colorTo,
    tokenLabel,
    poolEmoji,
    tokenIcon,
    vapr,
    chainId,
    tokenFaucetRewards,
    isTokenFaucetRewardsFetched,
    isTokenFaucetDataFetched,
    depositPrompt,
    refetch
  } = props
  const [isOpen, setIsOpen] = useState(false)

  const { ticket } = balances

  const openBottomSheet = () => setIsOpen(true)

  return (
    <>
      <div
        className='rounded-lg p-4 text-white flex flex-col space-y-4'
        style={{
          backgroundImage: `linear-gradient(300deg, ${colorFrom} 0%, ${colorTo} 100%)`
        }}
      >
        <StakingCardTitle tokenLabel={tokenLabel} tokenIcon={tokenIcon} poolEmoji={poolEmoji} />
        {balances.ticket.hasBalance ? (
          <ManageState
            vapr={vapr}
            chainId={chainId}
            ticket={ticket}
            tokenFaucetRewards={tokenFaucetRewards}
            isTokenFaucetRewardsFetched={isTokenFaucetRewardsFetched}
            isTokenFaucetDataFetched={isTokenFaucetDataFetched}
            openBottomSheet={openBottomSheet}
          />
        ) : (
          <DepositState
            chainId={chainId}
            vapr={vapr}
            depositPrompt={depositPrompt}
            tokenFaucetRewards={tokenFaucetRewards}
            isTokenFaucetRewardsFetched={isTokenFaucetRewardsFetched}
            isTokenFaucetDataFetched={isTokenFaucetDataFetched}
            openBottomSheet={openBottomSheet}
          />
        )}
      </div>
      <StakingBottomSheet
        chainId={balances.chainId}
        balances={balances}
        isOpen={isOpen}
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
    <div className='flex w-full justify-between'>
      <div className='flex flex-col xs:flex-row xs:items-center'>
        {tokenIcon}
        <span className='xs:ml-2 font-semibold text-sm'>
          {t('stake')} {tokenLabel}
        </span>
      </div>
      <div className='text-xl' style={{ textShadow: '2px 2px 0px rgba(50, 10, 100, 0.3)' }}>
        {poolEmoji}
      </div>
    </div>
  )
}

interface ManageStateProps {
  vapr: number
  chainId: number
  ticket: TokenWithUsdBalance
  tokenFaucetRewards: TokenWithBalance
  isTokenFaucetRewardsFetched: boolean
  isTokenFaucetDataFetched: boolean
  openBottomSheet: () => void
}
const ManageState = (props: ManageStateProps) => {
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
              isTokenFaucetDataFetched={isTokenFaucetDataFetched}
              isTokenFetched={isTokenFaucetRewardsFetched}
            />
          }
        />
      </ul>
      <OpenModalButton className='ml-auto' onClick={openBottomSheet} label={t('manage')} />
    </>
  )
}

const ListItem = (props: { title: string; content: React.ReactNode }) => {
  return (
    <li className='flex w-full justify-between items-center'>
      <span className='font-bold text-sm'>{props.title}</span>
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
  <div className='flex space-x-2 font-bold text-sm items-center'>
    <TokenIconOrLoading chainId={props.chainId} token={props.token} isFetched={props.isFetched} />
    {props.isFetched ? (
      <>
        <span>{props.amount.amountPretty}</span>
        <span>{props.token.symbol}</span>
      </>
    ) : (
      <ThemedClipSpinner sizeClassName='w-3 h-3 xs:w-4 xs:h-4 opacity-50' />
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
  isTokenFaucetDataFetched: boolean
  isTokenFetched: boolean
}) => (
  <div className='flex space-x-2 font-bold text-sm items-center'>
    <TokenIconOrLoading
      chainId={props.chainId}
      token={props.token}
      isFetched={props.isTokenFetched}
    />
    <span>
      <VAPROrLoading vapr={props.vapr} isFetched={props.isTokenFaucetDataFetched} />
      <VAPRTooltip />
    </span>
  </div>
)

interface DepositStateProps {
  chainId: number
  vapr: number
  depositPrompt: string
  tokenFaucetRewards: TokenWithBalance
  isTokenFaucetRewardsFetched: boolean
  isTokenFaucetDataFetched: boolean
  openBottomSheet: () => void
}
const DepositState = (props: DepositStateProps) => {
  const {
    vapr,
    depositPrompt,
    tokenFaucetRewards,
    isTokenFaucetRewardsFetched,
    isTokenFaucetDataFetched,
    chainId,
    openBottomSheet
  } = props
  const { t } = useTranslation()
  return (
    <>
      <div className='space-y-2 flex flex-col'>
        <p className='text-sm'>{depositPrompt}</p>
        <div className='flex space-x-2 font-bold text-sm items-center'>
          <TokenIconOrLoading
            chainId={chainId}
            token={tokenFaucetRewards}
            isFetched={isTokenFaucetRewardsFetched}
          />
          <span>{t('earn')}</span>
          <VAPROrLoading vapr={vapr} isFetched={isTokenFaucetDataFetched} />
          <VAPRTooltip />
        </div>
      </div>
      <OpenModalButton className='ml-auto' onClick={openBottomSheet} label={t('deposit')} />
    </>
  )
}

const OpenModalButton = (props: { className?: string; onClick: () => void; label: string }) => (
  <button
    className={classNames(
      props.className,
      'flex items-center transition uppercase font-semibold text-sm opacity-90 hover:opacity-100 rounded-lg bg-pt-purple-darker bg-opacity-20 hover:bg-opacity-10 pl-4'
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

const TokenIconOrLoading = (props: { chainId: number; token: Token; isFetched: boolean }) => (
  <>
    {props.isFetched ? (
      <TokenIcon
        chainId={props.chainId}
        address={props.token.address}
        sizeClassName='w-4 h-4 xs:w-6 xs:h-6'
      />
    ) : (
      <ThemedClipSpinner sizeClassName='w-4 h-4 xs:w-6 xs:h-6' className='opacity-50' />
    )}
  </>
)

const VAPROrLoading = (props: { vapr: number; isFetched: boolean }) => (
  <>
    {props.isFetched ? (
      <span>{displayPercentage(String(props.vapr))}%</span>
    ) : (
      <ThemedClipSpinner sizeClassName='w-3 h-3 xs:w-4 xs:h-4 opacity-50' />
    )}{' '}
  </>
)

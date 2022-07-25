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
import { AccountListItem } from '../AccountList/AccountListItem'
import { AccountListItemTokenBalance } from '../AccountList/AccountListItemTokenBalance'

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
  const { balances, refetch } = props
  const [isOpen, setIsOpen] = useState(false)
  const openBottomSheet = () => setIsOpen(true)

  return (
    <>
      <AccountListItem
        left={<Left {...props} />}
        right={<Right {...props} />}
        onClick={openBottomSheet}
      />
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

const Right: React.FC<StakingCardProps> = (props) => {
  const {
    chainId,
    tokenFaucetRewards,
    vapr,
    isTokenFaucetDataFetched,
    isTokenFaucetRewardsFetched,
    balances
  } = props
  const { t } = useTranslation()

  if (vapr) {
    return (
      <>
        <span className='font-bold text-sm xs:text-lg'>{t('earning')}</span>
        <TokenAndVAPR
          chainId={chainId}
          token={tokenFaucetRewards}
          vapr={vapr}
          isTokenFaucetDataFetched={isTokenFaucetDataFetched}
          isTokenFetched={isTokenFaucetRewardsFetched}
        />
      </>
    )
  }

  return <AccountListItemTokenBalance chainId={chainId} token={balances?.ticket} />
}

const Left: React.FC<StakingCardProps> = (props) => {
  const { tokenIcon, tokenLabel, poolEmoji } = props
  const { t } = useTranslation()

  return (
    <>
      <div className='flex flex-row items-center space-x-2'>
        {tokenIcon}
        <span>
          {t('stake')} {tokenLabel}
        </span>
        <span>{poolEmoji}</span>
      </div>
    </>
  )
}

const TokenAndAmount = (props: {
  chainId: number
  token: Token
  amount: Amount
  isFetched?: boolean
}) => (
  <div className='flex space-x-2 font-bold text-sm xs:text-lg items-center'>
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
  <div className='flex space-x-2 font-bold text-lg items-center'>
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

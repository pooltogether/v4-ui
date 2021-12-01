import { useOnboard } from '@pooltogether/bnc-onboard-hooks'
import {
  Amount,
  Token,
  TokenBalance,
  useIsWalletMetamask,
  useTransaction
} from '@pooltogether/hooks'
import FeatherIcon from 'feather-icons-react'
import {
  addTokenToMetamask,
  LoadingDots,
  NetworkIcon,
  poolToast,
  ThemedClipSpinner,
  TokenIcon
} from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { User, PrizePool } from '@pooltogether/v4-js-client'
import { Menu, MenuButton, MenuItem, MenuList } from '@reach/menu-button'
import classnames from 'classnames'
import { BigNumber, Overrides } from 'ethers'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'

import { InfoBoxContainer } from 'lib/components/InfoBoxContainer'
import { TxHashRow } from 'lib/components/TxHashRow'
import { useSelectedNetworkUser } from 'lib/hooks/Tsunami/User/useSelectedNetworkUser'
import { usePrizePools } from 'lib/hooks/Tsunami/PrizePool/usePrizePools'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { usePrizePoolTokenValue } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokenValue'
import { useUsersDepositAllowance } from 'lib/hooks/Tsunami/PrizePool/useUsersDepositAllowance'
import { useUsersPrizePoolBalances } from 'lib/hooks/Tsunami/PrizePool/useUsersPrizePoolBalances'
import { useIsWalletOnNetwork } from 'lib/hooks/useIsWalletOnNetwork'
import { useSelectedNetwork } from 'lib/hooks/useSelectedNetwork'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { DelegateTicketsSection } from 'lib/views/Account/DelegateTicketsSection'
import { WithdrawModal } from 'lib/views/Account/WithdrawModal'
import { UsersOddsValue } from 'lib/components/UpdatedOddsListItem'
import { useUsersAddress } from 'lib/hooks/useUsersAddress'

const TOKEN_IMG_URL = {
  PTaUSDC: 'https://app.pooltogether.com/ptausdc@2x.png'
}

interface PrizePoolListProps {
  className?: string
  user: User
  isFetched: boolean
}

export const ManageBalancesList = (props: PrizePoolListProps) => {
  const { user, isFetched, className } = props
  const prizePools = usePrizePools()

  if (!isFetched) {
    return (
      <div className={classnames(className, 'w-full flex h-60')}>
        <LoadingDots className='m-auto' />
      </div>
    )
  }

  return (
    <ul className={classnames(className, 'w-full')}>
      {prizePools.map((prizePool) => (
        <PrizePoolRow key={prizePool.id()} user={user} prizePool={prizePool} />
      ))}
    </ul>
  )
}

interface PrizePoolRowProps {
  prizePool: PrizePool
  user: User
}

const PrizePoolRow = (props: PrizePoolRowProps) => {
  const { prizePool, user } = props
  const usersAddress = useUsersAddress()
  const { data: usersBalancesData, isFetched: isUsersBalancesFetched } = useUsersPrizePoolBalances(
    usersAddress,
    prizePool
  )
  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)

  const usersBalances = usersBalancesData?.[usersAddress]
  const isFetched = isUsersBalancesFetched && isPrizePoolTokensFetched

  return (
    <li className='w-full flex flex-col mb-4 last:mb-0 rounded-xl bg-card px-4 sm:px-6 py-4'>
      <div className='w-full flex flex-row justify-between mb-4 mt-1'>
        <div className='flex flex-row items-center mb-auto'>
          <NetworkIcon sizeClassName='w-5 xs:w-6 h-5 xs:h-6' chainId={prizePool.chainId} />
          <span className='ml-2 xs:text-lg text-accent-1'>
            {getNetworkNiceNameByChainId(prizePool.chainId)}
          </span>
        </div>

        <div className='flex flex-col'>
          <Balance
            prizePool={prizePool}
            isFetched={isFetched}
            balance={usersBalances?.ticket}
            ticket={prizePoolTokens?.ticket}
            token={prizePoolTokens?.token}
          />
          {/* <WinningOdds prizePool={prizePool} className='ml-auto' /> */}
        </div>
      </div>

      <ManageBalanceButtons user={user} prizePool={prizePool} />
      <DelegateTicketsSection
        prizePool={prizePool}
        className='mt-4'
        balance={usersBalances?.ticket}
      />
    </li>
  )
}

const WinningOdds = (props: { prizePool: PrizePool; className?: string }) => {
  const { prizePool, className } = props
  const { t } = useTranslation()
  return (
    <span className={classNames(className, 'text-xxs')}>
      <span className='text-accent-1'>{t('winningOdds')}:</span>
      <span className='ml-1 font-bold'>
        <UsersOddsValue emptyString='--' />
        <span className='opacity-30'>*</span>
      </span>
    </span>
  )
}

interface ManageBalanceButtonsProps extends PrizePoolRowProps {}

export enum WithdrawalSteps {
  input,
  review,
  viewTxReceipt
}

const ManageBalanceButtons = (props: ManageBalanceButtonsProps) => {
  const { user, prizePool } = props

  const usersAddress = useUsersAddress()
  const [amountToWithdraw, setAmountToWithdraw] = useState<Amount>()
  const [currentStep, setCurrentStep] = useState<WithdrawalSteps>(WithdrawalSteps.input)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { t } = useTranslation()
  const { setSelectedChainId } = useSelectedNetwork()

  const [withdrawTxId, setWithdrawTxId] = useState(0)
  const withdrawTx = useTransaction(withdrawTxId)

  const sendTx = useSendTransaction()

  const form = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })
  const { reset } = form

  const { data: prizePoolTokens, isFetched: isPrizePoolTokensFetched } =
    usePrizePoolTokens(prizePool)

  let token
  if (isPrizePoolTokensFetched && prizePoolTokens) {
    token = prizePoolTokens.token
  }

  const {
    data: usersBalancesData,
    isFetched: isUsersBalancesFetched,
    refetch: refetchUsersBalances
  } = useUsersPrizePoolBalances(usersAddress, prizePool)
  const usersBalances = usersBalancesData?.[usersAddress]

  const sendWithdrawTx = async (e) => {
    e.preventDefault()

    const tokenSymbol = token.symbol
    const overrides: Overrides = { gasLimit: 750000 }

    const txId = await sendTx({
      name: `${t('withdraw')} ${amountToWithdraw?.amountPretty} ${tokenSymbol}`,
      method: 'withdrawInstantlyFrom',
      callTransaction: () => user.withdraw(amountToWithdraw?.amountUnformatted, overrides),
      callbacks: {
        onSent: () => setCurrentStep(WithdrawalSteps.viewTxReceipt),
        refetch: () => {
          refetchUsersBalances()
        }
      }
    })
    setWithdrawTxId(txId)
  }

  const resetState = () => {
    reset()
    setWithdrawTxId(0)
    setAmountToWithdraw(undefined)
    setCurrentStep(WithdrawalSteps.input)
  }

  const handleWithdrawClick = () => {
    if (withdrawTx?.completed) {
      resetState()
    }
    setSelectedChainId(prizePool.chainId)
    setIsModalOpen(true)
  }

  return (
    <>
      <WithdrawModal
        isOpen={isModalOpen}
        user={user}
        prizePool={prizePool}
        withdrawTx={withdrawTx}
        currentStep={currentStep}
        prizePoolTokens={prizePoolTokens}
        isPrizePoolTokensFetched={isPrizePoolTokensFetched}
        usersBalances={usersBalances}
        isUsersBalancesFetched={isUsersBalancesFetched}
        amountToWithdraw={amountToWithdraw}
        form={form}
        closeModal={() => setIsModalOpen(false)}
        sendWithdrawTx={sendWithdrawTx}
        setWithdrawTxId={setWithdrawTxId}
        setCurrentStep={setCurrentStep}
        refetchUsersBalances={refetchUsersBalances}
        setAmountToWithdraw={setAmountToWithdraw}
      />

      {withdrawTx && (
        <InfoBoxContainer className='mb-2'>
          <TxHashRow depositTx={withdrawTx} chainId={prizePool.chainId} />
        </InfoBoxContainer>
      )}

      <div className='w-full flex flex-row justify-end py-1'>
        <ManageDepositDropdown {...props} handleWithdrawClick={handleWithdrawClick} />
      </div>
    </>
  )
}

interface BalanceProps {
  className?: string
  isFetched: boolean
  balance: TokenBalance
  ticket: Token
  token: Token
  prizePool: PrizePool
}

const Balance = (props: BalanceProps) => {
  const { prizePool, isFetched, balance, ticket } = props

  const { t } = useTranslation()

  const { wallet, isWalletConnected } = useOnboard()
  const isMetaMask = useIsWalletMetamask(wallet)
  const isWalletOnProperNetwork = useIsWalletOnNetwork(prizePool.chainId)

  if (!isFetched) {
    return (
      <BalanceContainer>
        <ThemedClipSpinner className='my-1' />
        <BalanceUsdValue className='text-accent-1 font-light text-xs ml-2' {...props} />
      </BalanceContainer>
    )
  } else if (!isWalletConnected) {
    return (
      <BalanceContainer>
        <span className='sm:text-lg font-bold'>--</span>
        <BalanceUsdValue className='text-accent-1 font-light text-xs ml-2' {...props} />
      </BalanceContainer>
    )
  }

  return (
    <BalanceContainer>
      <div className='flex flex-row items-center mb-auto xs:text-lg font-bold'>
        <TokenIcon
          sizeClassName={'w-5 xs:w-6 h-5 xs:h-6'}
          className='mr-2'
          chainId={prizePool.chainId}
          address={ticket.address}
        />
        <span>
          {balance.amountPretty} {ticket.symbol}
        </span>
      </div>
    </BalanceContainer>
  )
}

const BalanceContainer = (props) => <div {...props} className='flex sm:mt-0 sm:mb-0' />

const BalanceUsdValue = (props: BalanceProps) => {
  const { balance, token, prizePool } = props
  const { data: tokenPrice, isFetched: isTokenValueFetched } = usePrizePoolTokenValue(prizePool)

  if (!balance) {
    return <span className={classnames(props.className)}>($--)</span>
  } else if (!isTokenValueFetched) {
    return <span className={classnames(props.className)}>($--)</span>
  }

  return null

  // # TODO: why no usd price?
  // const usdValuePretty = numberWithCommas(balance.amountUnformatted.mul(tokenPrice.usd), {
  //   decimals: token.decimals
  // })
  //
  // return <span className={classnames(props.className)}>(${usdValuePretty})</span>
}

export const SettingsGearSvg = (props) => {
  return (
    <svg
      {...props}
      viewBox='0 0 16 15'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={classnames(props.className, 'fill-current')}
    >
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M13.23 8.235c.031-.24.054-.48.054-.735s-.023-.495-.054-.735l1.627-1.237a.371.371 0 00.093-.48l-1.542-2.595c-.093-.165-.3-.225-.47-.165l-1.92.75c-.401-.3-.833-.548-1.303-.735L9.422.315A.373.373 0 009.044 0H5.96a.373.373 0 00-.378.315l-.293 1.988c-.47.187-.902.442-1.303.735l-1.92-.75a.381.381 0 00-.47.165L.053 5.048a.363.363 0 00.093.48l1.627 1.237c-.031.24-.054.488-.054.735s.023.495.054.735L.146 9.473a.371.371 0 00-.093.48l1.543 2.595c.092.165.3.225.47.165l1.92-.75c.4.3.832.547 1.303.735l.293 1.987c.023.18.185.315.378.315h3.084a.373.373 0 00.378-.315l.293-1.988c.47-.187.902-.442 1.303-.734l1.92.75c.177.067.377 0 .47-.165l1.542-2.595a.371.371 0 00-.093-.48L13.23 8.235zM7.5 10a2.5 2.5 0 100-5 2.5 2.5 0 000 5z'
      />
    </svg>
  )
}

const ManageDepositDropdown = (props) => {
  const { prizePool, handleWithdrawClick, className } = props

  const { t } = useTranslation()

  const router = useRouter()

  const { wallet } = useOnboard()
  const isMetaMask = useIsWalletMetamask(wallet)
  const isWalletOnProperNetwork = useIsWalletOnNetwork(prizePool?.chainId)

  const chainId = prizePool?.chainId
  const currentNetworkName = getNetworkNiceNameByChainId(chainId)

  const { data: prizePoolTokens } = usePrizePoolTokens(prizePool)

  const ticket = prizePoolTokens?.ticket
  const token = prizePoolTokens?.token

  const { data: depositAllowance, refetch: refetchUsersDepositAllowance } =
    useUsersDepositAllowance(prizePool)

  const isApproved = depositAllowance?.isApproved

  const sendTx = useSendTransaction()
  const [txId, setTxId] = useState(0)
  const tx = useTransaction(txId)

  const { data: user, isFetched: isUserFetched } = useSelectedNetworkUser()

  const handleRevokeAllowanceClick = async () => {
    if (!isWalletOnProperNetwork) {
      poolToast.warn(
        t(
          'switchToNetworkToRevokeToken',
          `Switch to {{networkName}} to revoke '{{token}}' token allowance`,
          {
            networkName: currentNetworkName,
            token: token.symbol
          }
        )
      )
      return null
    }

    const name = t(`revokePoolAllowance`, { ticker: token.symbol })
    const txId = await sendTx({
      name,
      method: 'approve',
      callTransaction: async () => user.approveDeposits(BigNumber.from(0)),
      callbacks: {
        refetch: () => refetchUsersDepositAllowance()
      }
    })

    setTxId(txId)
  }

  const handleAddTokenToMetaMask = async () => {
    if (!ticket) {
      return
    }

    if (!isWalletOnProperNetwork) {
      poolToast.warn(
        t('switchToNetworkToAddToken', `Switch to {{networkName}} to add token '{{token}}'`, {
          networkName: currentNetworkName,
          token: token.symbol
        })
      )
      return null
    }

    addTokenToMetamask(
      ticket.symbol,
      ticket.address,
      Number(ticket.decimals),
      TOKEN_IMG_URL[ticket.symbol]
    )
  }

  return (
    <>
      <Menu>
        {({ isExpanded }) => (
          <>
            <MenuButton
              className={classnames(
                className,
                'sm:text-sm transition hover:text-highlight-9 leading-none tracking-wide py-2 px-4',
                'square-btn square-btn--teal-outline square-btn--sm relative text-xs',
                'inline-flex items-center justify-center trans'
              )}
            >
              <SettingsGearSvg className='w-4 mr-2' />
              {t('manageDeposit', 'Manage deposit')}{' '}
              <FeatherIcon
                icon={isExpanded ? 'chevron-up' : 'chevron-down'}
                className='relative w-4 h-4 inline-block ml-2'
                strokeWidth='0.15rem'
              />
            </MenuButton>

            <MenuList className={`tsunami-dropdown-md slide-down overflow-y-auto max-h-1/2`}>
              <MenuItem
                key={`manage-deposits-item-withdraw`}
                onSelect={() => {
                  router.push({
                    pathname: '/deposit',
                    query: {
                      ...router.query,
                      network: prizePool.chainId
                    }
                  })
                }}
                className='flex items-center'
              >
                <FeatherIcon icon='arrow-down' className='w-5 mr-1' /> {t('deposit')}
              </MenuItem>
              <MenuItem
                key={`manage-deposits-item-deposit`}
                onSelect={() => {
                  handleWithdrawClick()
                }}
                className='flex items-center'
              >
                <FeatherIcon icon='arrow-up' className='w-5 mr-1' /> {t('withdraw')}
              </MenuItem>
              {isMetaMask && (
                <MenuItem
                  key={`manage-deposits-item-add-to-metamask`}
                  onSelect={handleAddTokenToMetaMask}
                  className='flex items-center'
                >
                  <FeatherIcon icon='plus-circle' className='w-5 mr-1' />{' '}
                  {t('addTicketTokenToMetamask', {
                    token: ticket?.symbol
                  })}
                </MenuItem>
              )}
              {isApproved && (
                <MenuItem
                  key={`manage-deposits-item-revoke`}
                  onSelect={handleRevokeAllowanceClick}
                  className='flex items-center'
                >
                  <FeatherIcon icon='minus-circle' className='w-5 mr-1' />{' '}
                  {t('revokePoolAllowance', {
                    ticker: token?.symbol
                  })}
                </MenuItem>
              )}
            </MenuList>
          </>
        )}
      </Menu>
    </>
  )
}

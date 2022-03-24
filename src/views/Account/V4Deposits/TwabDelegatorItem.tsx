import FeatherIcon from 'feather-icons-react'
import { useMemo, useState } from 'react'
import { useQueries, UseQueryOptions } from 'react-query'
import {
  Delegation,
  DelegationId,
  TwabDelegator,
  SUPPORTED_CHAIN_IDS,
  TWAB_DELEGATOR_ADDRESS
} from '@pooltogether/v4-twab-delegator-js'
import { useAppEnvString } from '@hooks/useAppEnvString'
import {
  getNetworkNiceNameByChainId,
  getReadProvider,
  prettyNumber,
  toScaledUsdBigNumber
} from '@pooltogether/utilities'
import {
  BlockExplorerLink,
  CountUp,
  NetworkIcon,
  SquareLink,
  TokenIcon
} from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'
import { BottomSheet } from '@components/BottomSheet'
import { BigNumber } from 'ethers'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { Amount, Token, TokenWithUsdBalance } from '@pooltogether/hooks'
import { PrizePoolDepositBalance } from '@components/PrizePoolDepositList/PrizePoolDepositBalance'
import classNames from 'classnames'
import { getAmountFromString } from '@utils/getAmountFromString'
import { NO_REFETCH } from '@constants/query'
import { makeStablecoinTokenWithUsdBalance } from '@utils/makeStablecoinTokenWithUsdBalance'

export const TwabDelegatorItem: React.FC<{ delegator: string }> = (props) => {
  const { delegator } = props

  const { data, isFetched } = useAllDelegations(delegator)
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  if (!isFetched || data.totalTokenWithUsdBalance.amountUnformatted.isZero()) return null

  const { delegationsPerChain, totalTokenWithUsdBalance } = data

  return (
    <li className='transition bg-white bg-opacity-70 hover:bg-opacity-100 dark:bg-actually-black dark:bg-opacity-10 dark:hover:bg-opacity-20 rounded-lg'>
      <button
        className='p-4 w-full flex justify-between items-center'
        onClick={() => setIsOpen(true)}
      >
        <div className='flex space-x-2 font-bold xs:text-lg'>
          <span>{'🤝'}</span>
          <span>{t('totalDelegations', 'Total amount delegated')}</span>
        </div>

        <PrizePoolDepositBalance
          chainId={delegationsPerChain[0].chainId}
          token={totalTokenWithUsdBalance}
        />
      </button>
      <DepositDelegationsSheet
        delegationsPerChain={delegationsPerChain}
        isOpen={isOpen}
        onDismiss={() => setIsOpen(false)}
      />
    </li>
  )
}

const DepositDelegationsSheet: React.FC<{
  delegationsPerChain: {
    chainId: number
    delegations: (DelegationId & Delegation)[]
    ticket: {
      address: string
      symbol: string
      name: string
      decimals: string
    }
    totalAmount: Amount
  }[]
  isOpen: boolean
  onDismiss: () => void
}> = (props) => {
  const { isOpen, onDismiss, delegationsPerChain } = props

  return (
    <BottomSheet
      label='deposit-delegation-sheet'
      open={isOpen}
      onDismiss={onDismiss}
      className='flex flex-col space-y-4'
    >
      <div className='mx-auto text-2xl font-bold text-inverse'>Deposit Delegations</div>
      <p className='opacity-70 text-xs text-center mb-6'>
        Delegate your chances to win without losing custody of your deposit.
      </p>
      <ul className='space-y-4'>
        {delegationsPerChain.map((data) => (
          <DelegationsList key={`delegation-list-${data.chainId}`} {...data} />
        ))}
      </ul>
      <SquareLink
        href={`https://tools.pooltogether.com/delegate`}
        className='items-center space-x-2 mt-6'
      >
        <span>Manage delegations</span>
        <FeatherIcon icon='external-link' className='w-5 h-5' />
      </SquareLink>
    </BottomSheet>
  )
}

const DelegationsList: React.FC<{
  chainId: number
  delegations: (DelegationId & Delegation)[]
  ticket: Token
  totalAmount: Amount
}> = (props) => {
  const { chainId, delegations, ticket } = props

  if (delegations.length === 0) return null

  return (
    <li className='bg-body p-4 rounded '>
      <div className='space-x-6 mb-2 flex'>
        <div className='space-x-2 flex items-center '>
          <NetworkIcon chainId={chainId} className='' sizeClassName='w-5 h-5' />
          <span className='capitalize leading-none tracking-wider font-bold'>
            {getNetworkNiceNameByChainId(chainId)}
          </span>
        </div>
        <div className='space-x-2 flex items-center '>
          <TokenIcon chainId={chainId} address={ticket.address} sizeClassName='w-5 h-5' />
          <span className='capitalize leading-none tracking-wider font-bold'>{ticket.symbol}</span>
        </div>
      </div>
      <DelegationHeaders />
      <ul className='space-y-1 overflow-auto max-h-44'>
        {delegations.map((delegation) => (
          <DelegationItem
            key={`delegation-${delegation.delegator}-${delegation.slot.toString()}`}
            delegation={delegation}
            ticket={ticket}
            chainId={chainId}
          />
        ))}
      </ul>
    </li>
  )
}

const DelegationHeaders = () => (
  <div className='grid grid-cols-5 mb-1'>
    <span className='col-span-1 opacity-50' />
    <span className='col-span-2 uppercase opacity-50 font-bold text-xxxs'>Address</span>
    <span className='col-span-2 uppercase opacity-50 font-bold text-xxxs'>Amount</span>
  </div>
)

const DelegationItem: React.FC<{
  chainId: number
  delegation: Delegation & DelegationId
  ticket: Token
}> = (props) => {
  const { chainId, delegation, ticket } = props
  return (
    <li className='grid grid-cols-5 items-center'>
      <span className='col-span-1 opacity-50'>{delegation.slot.toString()}</span>
      <span className='col-span-2'>
        <BlockExplorerLink address={delegation.delegatee} chainId={chainId} shorten />
      </span>
      <span className={classNames('col-span-2', { 'opacity-50': delegation.balance.isZero() })}>
        {prettyNumber(delegation.balance, ticket.decimals)}
      </span>
    </li>
  )
}

/**
 * NOTE: This will need to be expanded for multiple prize pools on the same chain
 * @param delegator
 * @returns
 */
export const useAllDelegations = (
  delegator: string
): {
  isFetched: boolean
  isFetching: boolean
  refetch: () => void
  data: {
    ticket: {
      address: string
      symbol: string
      name: string
      decimals: string
    }
    delegationsPerChain: {
      chainId: number
      delegations: (DelegationId & Delegation)[]
      ticket: {
        address: string
        symbol: string
        name: string
        decimals: string
      }
      totalAmount: Amount
    }[]
    totalAmount: Amount
    totalTokenWithUsdBalance: TokenWithUsdBalance
  }
} => {
  const appEnv = useAppEnvString()
  const queriesResult = useQueries<
    UseQueryOptions<{
      chainId: number
      delegations: (DelegationId & Delegation)[]
      ticket: {
        address: string
        symbol: string
        name: string
        decimals: string
      }
      totalAmount: Amount
    }>[]
  >(
    SUPPORTED_CHAIN_IDS[appEnv].map((chainId) => ({
      ...NO_REFETCH,
      queryKey: ['useDelegations', chainId, delegator],
      enabled: !!delegator,
      queryFn: () => getDelegations(chainId, delegator)
    }))
  )

  const isFetched = queriesResult.every(({ isFetched }) => isFetched)
  const isFetching = queriesResult.some(({ isFetching }) => isFetching)

  return useMemo(() => {
    const refetch = () => queriesResult.forEach(({ refetch }) => refetch())
    if (!isFetched) {
      return {
        isFetching,
        isFetched: false,
        data: undefined,
        refetch
      }
    }

    const delegationsPerChain = queriesResult.map(({ data }) => data)
    // NOTE: This is hacky. Assuming all have the same decimals and ticket image.
    const ticket = queriesResult[0].data.ticket
    const totalAmountUnformatted = delegationsPerChain.reduce(
      (sum, data) => sum.add(data.totalAmount.amountUnformatted),
      BigNumber.from(0)
    )
    const totalAmount = getAmountFromBigNumber(totalAmountUnformatted, ticket.decimals)
    const totalTokenWithUsdBalance = makeStablecoinTokenWithUsdBalance(
      totalAmountUnformatted,
      ticket
    )

    return {
      isFetching,
      isFetched,
      refetch,
      data: {
        ticket,
        delegationsPerChain,
        totalAmount,
        totalTokenWithUsdBalance
      }
    }
  }, [isFetched, isFetching, delegator])
}

/**
 *
 * @param chainId
 * @param delegator
 * @returns
 */
const getDelegations = async (chainId: number, delegator: string) => {
  const provider = getReadProvider(chainId)
  const twabDelegatorAddress = TWAB_DELEGATOR_ADDRESS[chainId]
  const twabDelegator = new TwabDelegator(chainId, provider, twabDelegatorAddress)
  const delegations = await fetchAllPagesOfDelegations(twabDelegator, delegator)
  const ticket = await twabDelegator.getTicket()
  const totalAmountUnformatted = delegations.reduce(
    (sum, delegation) => sum.add(delegation.balance),
    BigNumber.from(0)
  )
  const totalAmount = getAmountFromBigNumber(totalAmountUnformatted, ticket.decimals)

  return {
    chainId,
    delegations,
    ticket,
    totalAmount
  }
}

/**
 *
 * @param twabDelegator
 * @param delegator
 */
const fetchAllPagesOfDelegations = async (twabDelegator: TwabDelegator, delegator: string) => {
  const delegations: (DelegationId & Delegation)[] = []
  const pageSize = 25

  const fetchPage = async (page: number) => {
    const _delegations = await twabDelegator.getDelegationsByPage(delegator, page, pageSize)
    if (_delegations.length > 0) {
      delegations.push(..._delegations)
      if (_delegations.length >= pageSize - 3) {
        return await fetchPage(page + 1)
      }
    }
    return
  }

  await fetchPage(0)
  return delegations
}

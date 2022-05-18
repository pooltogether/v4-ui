import { CHAIN_ID } from '@constants/misc'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { BlockExplorerLink, ThemedClipSpinner, TokenIcon } from '@pooltogether/react-components'
import { Amount, Token, usePrizePoolTokens } from '@pooltogether/hooks'
import { useEffect, useState } from 'react'
import { useUsersTicketDelegate } from '@hooks/v4/PrizePool/useUsersTicketDelegate'
import {
  Draw,
  PrizeAwardable,
  PrizeDistribution,
  PrizeDistributor,
  PrizePool
} from '@pooltogether/v4-client-js'
import { FieldValues, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useGetUser } from '@hooks/v4/User/useGetUser'
import {
  Transaction,
  TransactionState,
  TransactionStatus,
  useTransaction,
  useUsersAddress
} from '@pooltogether/wallet-connection'
import { useSendTransaction } from '@hooks/useSendTransaction'
import { ethers } from 'ethers'
import { InfoList } from '@components/InfoList'
import { TxReceiptItem } from '@components/InfoList/TxReceiptItem'
import { TxButton } from '@components/Input/TxButton'
import { useQuery } from 'react-query'
import { usePrizePoolByChainId } from '@hooks/v4/PrizePool/usePrizePoolByChainId'
import { msToS, numberWithCommas } from '@pooltogether/utilities'
import { useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork } from '@hooks/v4/Odds/useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork'
import { EstimateAction } from '@hooks/v4/Odds/useEstimatedOddsForAmount'
import { usePrizeDistributorByChainId } from '@hooks/v4/PrizeDistributor/usePrizeDistributorByChainId'
import { useValidDrawIds } from '@hooks/v4/PrizeDistributor/useValidDrawIds'
import { useAllPartialDrawDatas } from '@hooks/v4/PrizeDistributor/useAllPartialDrawDatas'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import classNames from 'classnames'
import { DrawData } from '@interfaces/v4'
import { roundPrizeAmount } from '@utils/roundPrizeAmount'
import { TokenSymbolAndIcon } from '@components/TokenSymbolAndIcon'
import ordinal from 'ordinal'
import { getAmountFromBigNumber } from '@utils/getAmountFromBigNumber'
import { NO_REFETCH } from '@constants/query'
import { loopXTimes } from '@utils/loopXTimes'

const DELEGATE_ADDRESS_KEY = 'delegate_ukraine'

const UNCHAIN_ADDRESS = '0xb37b3b78022E6964fe80030C9161525880274010'

export const DonateUI = () => {
  useSetPolygonOnMount()

  return (
    <PagePadding className='px-2 xs:px-12 lg:px-40 pb-20'>
      <Title />
      <div className='mb-4 space-y-4 sm:space-y-0 grid grid-cols-3 gap-4'>
        <InfoCard className='col-span-3 sm:col-span-2' />
        <DelegateCard className='col-span-3 sm:col-span-1' />
        <PrizesWon className='col-span-3' />
      </div>

      <ExplainerCard />
    </PagePadding>
  )
}

const Title = () => (
  <div className='flex flex-col items-center justify-center mt-4 sm:mt-10 mb-4 sm:mb-12 px-8'>
    <div className='flex'>
      <span className='text-4xl sm:text-9xl'>🤝</span>
      <span className='text-4xl sm:text-9xl'>🇺🇦</span>
    </div>
    <h4 className='opacity-80 text-center'>PoolTogether No Loss Donation</h4>
  </div>
)

const Card = (props) => {
  return (
    <div
      className={classNames(
        'rounded-lg px-4 py-6 xs:p-8 bg-pt-purple-lightest dark:bg-opacity-40 dark:bg-pt-purple space-y-4',
        props.className
      )}
    >
      {props.children}
    </div>
  )
}

const InfoCard = (props) => {
  return (
    <Card className={props.className}>
      <DonationAmount />
      <h4>Support Ukraine Every Day</h4>

      <p className='sm:text-sm'>
        Instead of making a one-time donation to support the humanitarian crisis, you can donate
        every day, for free.
      </p>

      <p className='sm:text-sm'>
        With every dollar you deposit, PoolTogether gives you a chance to win that resets every day.
        By delegating your deposit, 100% of the prizes you win go directly to the people of Ukraine.
      </p>

      <p className='sm:text-sm'>
        Plus, because you never lose your initial deposit — you can get back to winning yourself or
        discover new charitable causes to support when this crisis is over.
      </p>
    </Card>
  )
}

const DelegateCard = (props) => {
  const usersAddress = useUsersAddress()
  const prizePool = usePrizePoolByChainId(CHAIN_ID.polygon)
  const [txId, setTxId] = useState('')
  const tx = useTransaction(txId)
  const { data: delegate, isFetched, refetch } = useUsersTicketDelegate(usersAddress, prizePool)

  return (
    <Card className={props.className}>
      <h4>How to help</h4>
      <p>
        1. Deposit into PoolTogether v4{' '}
        <a
          className='text-pt-teal hover:opacity-70'
          href='https://app.pooltogether.com'
          target='_blank'
          rel='noreferrer noopener'
        >
          here
        </a>
        .
      </p>
      <p className='mb-10'>
        2. Delegate your chances to{' '}
        <a
          className='text-pt-teal hover:opacity-70'
          href='https://unchain.fund/'
          target='_blank'
          rel='noreferrer noopener'
        >
          Unchain
        </a>{' '}
        below.
      </p>
      {(!usersAddress ||
        !isFetched ||
        delegate.ticketDelegate.toLowerCase() !== UNCHAIN_ADDRESS.toLowerCase()) && (
        <DelegateForm prizePool={prizePool} tx={tx} setTxId={setTxId} refetchDelegate={refetch} />
      )}
      {isFetched && delegate.ticketDelegate.toLowerCase() === UNCHAIN_ADDRESS.toLowerCase() && (
        <AlreadyDonating />
      )}
    </Card>
  )
}

const ExplainerCard = () => {
  return (
    <div className='p-4 mx-auto'>
      <h4>How it works</h4>
      <p className='mt-2 mb-4'>
        <a
          className='text-pt-teal hover:opacity-70'
          href='https://docs.pooltogether.com/welcome/faq'
          target='_blank'
          rel='noreferrer noopener'
        >
          PoolTogether
        </a>{' '}
        is a no loss prize protocol. The protocol supports a "delegation" feature. This feature
        allows any depositor to give their chances to win prizes to any other address. When
        delegating you maintain full control of your funds and can withdraw or take back your
        chances to win at any time. You can help the People of Ukraine, every day, until this is
        over.
      </p>
      <p>
        <a
          className='text-pt-teal hover:opacity-70'
          href='https://unchain.fund/'
          target='_blank'
          rel='noreferrer noopener'
        >
          Unchain
        </a>{' '}
        is a charity project created by blockchain activists. Their big goal is to help Ukraine
        become the country it deserves to be: peaceful, successful, substantive, friendly, educated,
        and free. Let’s unchain the real power of blockchain for the good.
      </p>
    </div>
  )
}

const useSetPolygonOnMount = () => {
  const { setSelectedChainId } = useSelectedChainId()
  useEffect(() => {
    setSelectedChainId(CHAIN_ID.polygon)
  }, [])
}

interface DelegateFormProps {
  prizePool: PrizePool
  tx: Transaction
  setTxId: (txId: string) => void
  refetchDelegate: () => void
}

export const DelegateForm = (props: DelegateFormProps) => {
  const { prizePool, refetchDelegate, setTxId, tx } = props

  const {
    handleSubmit,
    formState: { errors, isValid }
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })
  const { t } = useTranslation()
  const sendTransaction = useSendTransaction()
  const getUser = useGetUser(prizePool)

  const sendDelegateTx = async (x: FieldValues) => {
    const txId = await sendTransaction({
      name: t('delegateDeposit', 'Delegate deposit'),
      callTransaction: async () => {
        const user = await getUser()
        return user.delegateTickets(UNCHAIN_ADDRESS)
      },
      callbacks: {
        refetch: () => {
          refetchDelegate()
        }
      }
    })
    setTxId(txId)
  }

  const errorMessage = errors?.[DELEGATE_ADDRESS_KEY]?.message

  if (tx?.state === TransactionState.pending || tx?.status === TransactionStatus.success) {
    return (
      <InfoList bgClassName='bg-body'>
        <TxReceiptItem depositTx={tx} chainId={prizePool.chainId} />
      </InfoList>
    )
  }

  return (
    <form onSubmit={handleSubmit(sendDelegateTx)} className='flex flex-col'>
      <div className='bg-pt-purple-lightest dark:bg-pt-purple-darkest rounded-sm p-4 flex justify-between'>
        <span>Unchain charity address: </span>
        <BlockExplorerLink shorten chainId={CHAIN_ID.polygon} address={UNCHAIN_ADDRESS} />
      </div>
      <div className='h-8 text-pt-red text-center'>
        <span>{errorMessage}</span>
      </div>
      <TxButton
        chainId={prizePool.chainId}
        className='w-full'
        type='submit'
        state={tx?.state}
        status={tx?.status}
      >
        {t('updateDelegate', 'Update delegate')}
      </TxButton>
    </form>
  )
}

const AlreadyDonating = () => {
  return (
    <div className='flex flex-col'>
      <span>
        🤝 Thank you. Every day, the charity wallet has a better chance of winning prizes thanks to
        your deposit.
      </span>
      <span>
        To reset your delegation follow{' '}
        <a
          className='text-pt-teal hover:opacity-70'
          href='https://docs.pooltogether.com/pooltogether/guides/deposit-delegator'
        >
          these instructions
        </a>
        .
      </span>
    </div>
  )
}

const DonationAmount = () => {
  const { data: balance, isFetched } = useBalance()

  if (!isFetched) return null

  return (
    <>
      <div className='flex justify-center items-start'>
        <div className='flex mr-2 space-x-2 justify-center items-start w-1/2'>
          <TokenIcon
            address='0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
            chainId={CHAIN_ID.polygon}
            sizeClassName='w-6 h-6 mt-1 sm:mt-3 sm:w-8 sm:h-8'
          />
          <span className='flex flex-col'>
            <span className='text-flashy text-2xl xs:text-4xl sm:text-7xl font-bold leading-none'>
              {numberWithCommas(balance)}
            </span>
            <span className='my-auto font-bold opacity-80'>USDC DELEGATED</span>
          </span>
        </div>
        <div className='flex w-1/2 flex-col justify-center'>
          <OddsOfWinning />
        </div>
      </div>
    </>
  )
}

const useBalance = () => {
  const prizePool = usePrizePoolByChainId(CHAIN_ID.polygon)
  return useQuery(
    ['donation'],
    async () => {
      const ticketContract = await prizePool.getTicketContract()
      const timestamp = Math.floor(msToS(Date.now()))
      const r = await ticketContract.getBalanceAt(UNCHAIN_ADDRESS, timestamp)
      return ethers.utils.formatUnits(r, 6)
    },
    {
      refetchInterval: 5000
    }
  )
}

const OddsOfWinning = () => {
  const data = useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork(
    UNCHAIN_ADDRESS,
    EstimateAction.none,
    ethers.constants.Zero,
    1
  )

  const oneOverOddstring = Boolean(data)
    ? Number(data.oneOverOdds.toFixed(2)) < 1.01
      ? 1
      : data.oneOverOdds.toFixed(2)
    : null

  return (
    <>
      {oneOverOddstring ? (
        <span className='text-flashy text-2xl xs:text-4xl sm:text-7xl font-bold leading-none'>
          1:{oneOverOddstring}
        </span>
      ) : (
        <ThemedClipSpinner sizeClassName='w-3 h-3' />
      )}
      <span className='opacity-50 font-bold uppercase'>Daily odds to win at least 1 prize</span>
    </>
  )
}

const PrizesWon = (props) => {
  const prizePool = usePrizePoolByChainId(CHAIN_ID.polygon)
  const { data, isFetched } = usePrizesWon()
  const { data: tokens, isFetched: isTokensFetched } = usePrizePoolTokens(prizePool)

  if (!isFetched || !isTokensFetched) {
    return (
      <Card className={props.className}>
        <TotalWon isLoading />
        <ul className='flex flex-col space-y-2'>
          {loopXTimes(5, (i) => (
            <li
              key={`loading-list-${i}`}
              className='rounded-lg bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 animate-pulse w-full h-10'
            />
          ))}
        </ul>
      </Card>
    )
  }

  const { ticket, token } = tokens
  const { prizesWon, totalWon } = data

  return (
    <Card className={props.className}>
      <TotalWon amount={totalWon} />
      <ul className={classNames('text-inverse max-h-80 overflow-y-auto space-y-2 pr-2')}>
        {prizesWon.map((prizeWon, index) => (
          <PrizeRow
            key={`${prizeWon.drawData.draw.drawId}-${index}`}
            {...prizeWon}
            chainId={CHAIN_ID.polygon}
            ticket={ticket}
            token={token}
          />
        ))}
      </ul>
    </Card>
  )
}

const TotalWon = (props: { amount?: Amount; isLoading?: boolean }) => {
  return (
    <div className='flex space-x-2 justify-center mb-4 sm:mb-8'>
      <div className='flex mr-2 space-x-2 justify-center items-start'>
        <TokenIcon
          address='0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
          chainId={CHAIN_ID.polygon}
          sizeClassName='w-6 h-6 mt-1 sm:mt-2 sm:w-8 sm:h-8'
        />
        <span className='flex flex-col'>
          <span className='text-flashy text-2xl xs:text-4xl  font-bold leading-none'>
            {props.isLoading ? (
              <ThemedClipSpinner sizeClassName='w-4 h-4 sm:w-8 sm:h-8' />
            ) : (
              numberWithCommas(props.amount.amount)
            )}
          </span>
          <span className='my-auto font-bold opacity-80'>USDC IN PRIZES SO FAR</span>
        </span>
      </div>
    </div>
  )
}

const usePrizesWon = () => {
  const prizeDistributor = usePrizeDistributorByChainId(CHAIN_ID.polygon)
  const { data, isFetched: isDrawIdsFetched } = useValidDrawIds(prizeDistributor)
  const { data: partialDrawData, isFetched: isPartialDrawDataFetched } =
    useAllPartialDrawDatas(prizeDistributor)
  const enabled = isDrawIdsFetched && isPartialDrawDataFetched
  return useQuery(
    ['getPrizesWon'],
    async () => {
      return getPrizesWon(data.drawIds, partialDrawData, prizeDistributor)
    },
    { ...NO_REFETCH, enabled }
  )
}

const getPrizesWon = async (
  drawIds: number[],
  partialDrawData: {
    [drawId: number]: {
      draw: Draw
      prizeDistribution?: PrizeDistribution
    }
  },
  prizeDistributor: PrizeDistributor
) => {
  try {
    const maxPicksPerUserPerDraw = drawIds.map(
      (drawId) => partialDrawData[drawId].prizeDistribution.maxPicksPerUser
    )

    const drawResults = await prizeDistributor.getUsersDrawResultsForDrawIds(
      UNCHAIN_ADDRESS,
      drawIds,
      maxPicksPerUserPerDraw
    )

    const winningDrawResults = Object.values(drawResults).filter(
      (drawResult) => !drawResult.totalValue.isZero()
    )

    let totalWon = ethers.BigNumber.from(0)

    const prizesWon: { prize: PrizeAwardable; drawData: DrawData }[] = []
    winningDrawResults.reverse().forEach((drawResults) => {
      totalWon = totalWon.add(drawResults.totalValue)
      drawResults.prizes.forEach((prize) => {
        prizesWon.push({
          prize,
          drawData: partialDrawData[drawResults.drawId] as DrawData
        })
      })
    })

    const amount = getAmountFromBigNumber(totalWon, '6')

    return {
      prizesWon,
      totalWon: amount
    }
  } catch (e) {
    return getPrizesWon(drawIds.slice(0, drawIds.length - 1), partialDrawData, prizeDistributor)
  }
}

export const PagePadding = (props) => {
  const { className, children } = props

  const shouldReduceMotion = useReducedMotion()

  return (
    <AnimatePresence>
      <motion.div
        children={children}
        id='modal-animation-wrapper'
        transition={{ duration: shouldReduceMotion ? 0 : 0.1, ease: 'easeIn' }}
        initial={{
          opacity: 0
        }}
        exit={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        className={classNames('max-w-screen-lg mx-auto', className)}
      />
    </AnimatePresence>
  )
}

interface PrizeRowProps {
  chainId: number
  prize: PrizeAwardable
  drawData: DrawData
  ticket: Token
  token: Token
}

const PrizeRow = (props: PrizeRowProps) => {
  const { chainId, prize, ticket, drawData } = props
  const { prizeDistribution, draw } = drawData
  const { tiers } = prizeDistribution
  const { amount: amountUnformatted, tierIndex: _tierIndex } = prize

  const { t } = useTranslation()

  const filteredTiers = tiers.filter((tierValue) => tierValue > 0)
  const tierIndex = filteredTiers.indexOf(tiers[_tierIndex])

  const { amountPretty } = roundPrizeAmount(amountUnformatted, ticket.decimals)

  return (
    <li
      className={classNames('flex flex-row text-center rounded-lg text-xxs', {
        'bg-light-purple-10': tierIndex !== 0,
        'pool-gradient-3 ': tierIndex === 0
      })}
    >
      <div
        className={classNames(
          'flex rounded-lg flex-row w-full justify-between space-x-2 py-2 px-4 sm:px-6',
          {
            'bg-actually-black bg-opacity-60': tierIndex === 0
          }
        )}
      >
        <span className='flex items-center '>
          <span className='mr-2'>{amountPretty}</span>{' '}
          <TokenSymbolAndIcon chainId={chainId} token={ticket} />
        </span>
        <div>
          <span className='mr-2 font-bold opacity-50'>{`Draw #${draw.drawId}`}</span>
          <span>{`${ordinal(tierIndex + 1)} ${t('tier', 'Tier')} 🏆`}</span>
        </div>
      </div>
    </li>
  )
}

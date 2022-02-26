import { CHAIN_ID } from '@constants/misc'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { usePrizePoolBySelectedChainId } from '@hooks/v4/PrizePool/usePrizePoolBySelectedChainId'
import { BlockExplorerLink, LoadingScreen, TokenIcon } from '@pooltogether/react-components'
import { Transaction, useReadProvider, useTransaction } from '@pooltogether/hooks'
import { useEffect, useState } from 'react'
import { useUsersTicketDelegate } from '@hooks/v4/PrizePool/useUsersTicketDelegate'
import { useUsersAddress } from '@hooks/useUsersAddress'
import { CardTitle } from '@components/Text/CardTitle'
import { PrizePool } from '@pooltogether/v4-client-js'
import { FieldValues, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useUser } from '@hooks/v4/User/useUser'
import { useIsWalletOnNetwork } from '@hooks/useIsWalletOnNetwork'
import { useSendTransaction } from '@hooks/useSendTransaction'
import { Contract, ethers } from 'ethers'
import { InfoList } from '@components/InfoList'
import { TxReceiptItem } from '@components/InfoList/TxReceiptItem'
import { TxButtonNetworkGated } from '@components/Input/TxButtonNetworkGated'
import { useQuery } from 'react-query'
import { usePrizePoolByChainId } from '@hooks/v4/PrizePool/usePrizePoolByChainId'
import { msToS, numberWithCommas } from '@pooltogether/utilities'
import { useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork } from '@hooks/v4/useUsersUpcomingOddsOfWinningAPrizeOnAnyNetwork'
import { EstimateAction } from '@hooks/v4/useEstimatedOddsForAmount'

const DELEGATE_ADDRESS_KEY = 'delegate_ukraine'

const UNCHAIN_ADDRESS = '0xb37b3b78022E6964fe80030C9161525880274010'

export const DonateUI = () => {
  useSetPolygonOnMount()
  const usersAddress = useUsersAddress()
  const prizePool = usePrizePoolBySelectedChainId()
  const [txId, setTxId] = useState(0)
  const tx = useTransaction(txId)
  const { data: delegate, isFetched, refetch } = useUsersTicketDelegate(usersAddress, prizePool)

  if (prizePool.chainId !== CHAIN_ID.polygon) {
    return <>Loading</>
  }

  return (
    <>
      <h2 className='mb-4'>PoolTogether No Loss Donation</h2>

      <div className='rounded-lg p-4 bg-pt-purple-lightest dark:bg-opacity-40 dark:bg-pt-purple mb-4 space-y-4'>
        <h4>Support Ukraine Every Day 🤝🇺🇦</h4>

        <p>
          What if instead of making a one-time donation to support the humanitarian crisis, you
          could donate every day. PT’s help Ukraine initiative allows you to do just that.
        </p>

        <p>
          Every week PoolTogether gives away $120,225 to people deposited in the protocol. By
          delegating your deposit, any prizes you would have won are automatically donated to the
          people of Ukraine, continually until the crisis ends.
        </p>
      </div>

      <DonationAmount />

      <div className='rounded-lg p-4 bg-pt-purple-lightest dark:bg-opacity-40 dark:bg-pt-purple mb-4'>
        <h4>How to donate</h4>
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
          delegate[usersAddress].toLowerCase() !== UNCHAIN_ADDRESS.toLowerCase()) && (
          <DelegateForm prizePool={prizePool} tx={tx} setTxId={setTxId} refetchDelegate={refetch} />
        )}
        {isFetched && delegate[usersAddress].toLowerCase() === UNCHAIN_ADDRESS.toLowerCase() && (
          <AlreadyDonating />
        )}
      </div>

      <div className='rounded-lg p-4 bg-pt-purple-lightest dark:bg-opacity-40 dark:bg-pt-purple mb-4'>
        <h4>How it works</h4>
        <p className='mb-4'>
          <a
            className='text-pt-teal hover:opacity-70'
            href='https://docs.pooltogether.com/faq/general'
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
          become the country it deserves to be: peaceful, successful, substantive, friendly,
          educated, and free. Let’s unchain the real power of blockchain for the good.
        </p>
      </div>
    </>
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
  setTxId: (txId: number) => void
  refetchDelegate: () => void
}

export const DelegateForm = (props: DelegateFormProps) => {
  const { prizePool, refetchDelegate, setTxId, tx } = props

  const {
    handleSubmit,
    register,
    setValue,
    trigger,
    formState: { errors, isValid }
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })
  const { t } = useTranslation()
  const usersAddress = useUsersAddress()
  const sendTx = useSendTransaction()
  const user = useUser(prizePool)
  const isUserOnRightNetwork = useIsWalletOnNetwork(prizePool.chainId)

  const sendDelegateTx = async (x: FieldValues) => {
    const txId = await sendTx({
      name: t('delegateDeposit', 'Delegate deposit'),
      method: 'delegate',
      callTransaction: () => user.delegateTickets(UNCHAIN_ADDRESS),
      callbacks: {
        refetch: () => {
          refetchDelegate()
        }
      }
    })
    setTxId(txId)
  }

  const valitdationRules = {
    isValidAddress: (x: string) =>
      ethers.utils.isAddress(x) ? true : 'Please enter a valid address'
  }

  const errorMessage = errors?.[DELEGATE_ADDRESS_KEY]?.message

  if (tx?.inFlight || (tx?.completed && !tx?.error && !tx?.cancelled)) {
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
      <TxButtonNetworkGated
        toolTipId='submit-new-delegate-tooltip'
        chainId={prizePool.chainId}
        className='w-full'
        type='submit'
        disabled={!isValid || !isUserOnRightNetwork}
      >
        {t('updateDelegate', 'Update delegate')}
      </TxButtonNetworkGated>
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
          href='https://docs.pooltogether.com/how-to/how-to-delegate'
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
    <div className='rounded-lg flex-col p-4 bg-pt-purple-lightest dark:bg-opacity-40 dark:bg-pt-purple mb-4 space-x-2'>
      <div className='flex space-x-2 justify-center'>
        <TokenIcon
          address='0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
          chainId={CHAIN_ID.polygon}
          className='my-auto'
          sizeClassName='w-8 h-8'
        />
        <span className='flex space-x-2'>
          <span className='text-flashy text-4xl font-bold leading-none'>
            {numberWithCommas(balance)}
          </span>
          <span className='my-auto font-bold'>USDC Delegated</span>
        </span>
      </div>
      <OddsOfWinning />
    </div>
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
  if (!data) return null

  const { oneOverOdds } = data
  const oneOverOddstring = Number(oneOverOdds.toFixed(2)) < 1.01 ? 1 : oneOverOdds.toFixed(2)

  return (
    <div className='flex space-x-2 justify-center'>
      <span className='font-bold flex text-lg'>1:{oneOverOddstring}</span>
      <span className='my-auto opacity-50 font-bold uppercase'>
        Daily odds to win at least 1 prize
      </span>
    </div>
  )
}

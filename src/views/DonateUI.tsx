import { CHAIN_ID } from '@constants/misc'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { usePrizePoolBySelectedChainId } from '@hooks/v4/PrizePool/usePrizePoolBySelectedChainId'
import { BlockExplorerLink, LoadingScreen } from '@pooltogether/react-components'
import { Transaction, useTransaction } from '@pooltogether/hooks'
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
import { ethers } from 'ethers'
import { InfoList } from '@components/InfoList'
import { TxReceiptItem } from '@components/InfoList/TxReceiptItem'
import { TxButtonNetworkGated } from '@components/Input/TxButtonNetworkGated'

const DELEGATE_ADDRESS_KEY = 'delegate_ukraine'

const UKRAINE_ADDRESS = '0xb37b3b78022E6964fe80030C9161525880274010'

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

      <div className='rounded-lg p-4 bg-pt-purple-lightest dark:bg-opacity-40 dark:bg-pt-purple mb-10 space-y-4'>
        <h4>Support Ukraine Every Day 🤝🇺🇦</h4>

        <p>
          What if instead of making a one-time donation to support the humanitarian crisis, you
          could donate every day. PT’s help Urkaine initiative allows you to do just that.
        </p>

        <p>
          Every week PoolTogether gives away $120,225 to people deposited in the protocol. But
          instead of keeping that prize money for yourself, you can give that prize money to the
          people of Ukraine, continually until the crisis ends. When it does, you can send your
          deposit as a donation or keep it back for yourself. Either way, you can help the People of
          Ukraine, every day, until this is over.
        </p>
      </div>

      <div className='rounded-lg p-4 bg-pt-purple-lightest dark:bg-opacity-40 dark:bg-pt-purple mb-10'>
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
          </a>
          .
        </p>
        {(!usersAddress ||
          !isFetched ||
          delegate[usersAddress].toLowerCase() !== UKRAINE_ADDRESS.toLowerCase()) && (
          <DelegateForm prizePool={prizePool} tx={tx} setTxId={setTxId} refetchDelegate={refetch} />
        )}
        {isFetched && delegate[usersAddress].toLowerCase() === UKRAINE_ADDRESS.toLowerCase() && (
          <AlreadyDonating />
        )}
      </div>
      <div className='rounded-lg p-4 bg-pt-purple-lightest dark:bg-opacity-40 dark:bg-pt-purple mb-10'>
        <h4>How it works</h4>
        <p>
          <a
            className='text-pt-teal hover:opacity-70'
            href='https://docs.pooltogether.com/faq/general'
          >
            PoolTogether
          </a>{' '}
          is a no loss prize protocol. The protocol supports a "delegation" feature. This feature
          allows any depositor to give their chances to win prizes to any other address, while
          maintaining full custody of their funds.
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
      callTransaction: () => user.delegateTickets(UKRAINE_ADDRESS),
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
        <BlockExplorerLink shorten chainId={CHAIN_ID.polygon} address={UKRAINE_ADDRESS} />
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

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
      <CardTitle title={'PoolTogether No Loss Donation'} />
      <div className='rounded-lg p-4 bg-pt-purple-lightest dark:bg-opacity-40 dark:bg-pt-purple mb-10'>
        <h4>How to donate:</h4>
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
        <DelegateForm prizePool={prizePool} tx={tx} setTxId={setTxId} refetchDelegate={refetch} />
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
    const delegate = x[DELEGATE_ADDRESS_KEY]

    const txId = await sendTx({
      name: t('delegateDeposit', 'Delegate deposit'),
      method: 'delegate',
      callTransaction: () => user.delegateTickets(delegate),
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

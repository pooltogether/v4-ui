import React, { useEffect, useMemo, useState } from 'react'
import {
  ContractList,
  initializeLinkedPrizePool,
  LinkedPrizePool,
  Player,
  PrizePool,
  getContractListChainIds,
  Contract
} from '@pooltogether/v4-js-client'
import { testnets } from '@pooltogether/v4-pool-data'
import { useQuery, UseQueryOptions } from 'react-query'
import { LoadingDots, poolToast, SquareButton } from '@pooltogether/react-components'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { useForm } from 'react-hook-form'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider'
import { atom } from 'jotai'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { usePlayersBalances } from 'lib/hooks/Tsunami/Player/usePlayersBalances'
import { useSelectedNetworkPlayer } from 'lib/hooks/Tsunami/Player/useSelectedNetworkPlayer'
import { useSelectedNetworkPrizePool } from 'lib/hooks/Tsunami/PrizePool/useSelectedNetworkPrizePool'
import { usePrizePoolTokens } from 'lib/hooks/Tsunami/PrizePool/usePrizePoolTokens'
import { usePlayersDepositAllowance } from 'lib/hooks/Tsunami/Player/useUsersDepositAllowance'

export const TestPage = () => {
  const { data: prizePool, isFetched: isPrizePoolFetched } = useSelectedNetworkPrizePool()
  const { data: player, isFetched: isPlayerFetched } = useSelectedNetworkPlayer()
  const { data: balances, isFetched: isBalancesFetched } = usePlayersBalances(player)

  if (!isBalancesFetched || !isPrizePoolFetched) {
    return (
      <div className='flex w-full'>
        <LoadingDots className='mx-auto' />
      </div>
    )
  }

  const { ticket, token } = balances
  const decimals = ticket.decimals

  return (
    <div className='flex'>
      <div className='flex flex-col mx-auto'>
        <h3>Rinkeby</h3>
        <TokenBalance {...ticket} />
        <TokenBalance {...token} />
        <ApproveBtn player={player} />
        <DepositForm player={player} decimals={decimals} />
        <WithdrawForm player={player} decimals={decimals} />
      </div>
    </div>
  )
}

const TokenBalance = ({ amountPretty, name, symbol }) => (
  <div className='flex'>
    <span>{`${name} ${symbol}`}</span>
    <span className='ml-12'>{amountPretty}</span>
  </div>
)

interface ApproveBtnProps {
  player: Player
}

const ApproveBtn = (props: ApproveBtnProps) => {
  const { player } = props
  const { data: playersDepositAllowance, isFetched: isAllowanceFetched } =
    usePlayersDepositAllowance(player)

  if (!isAllowanceFetched) return <LoadingDots />

  return (
    <div className='flex justify-between w-full'>
      <SquareButton
        disabled={playersDepositAllowance.isApproved}
        onClick={() => player.approveDeposits()}
      >
        Approve
      </SquareButton>
    </div>
  )
}

const WithdrawForm = (props: { player: Player; decimals: string }) => {
  const { player, decimals } = props
  const inputKey = 'withdraw'

  const sendTx = useSendTransaction()

  const onSubmit = async (data) => {
    const amount = data[inputKey]
    const amountUnformatted = parseUnits(amount, decimals)
    const txResponse = await player.withdrawTicket(amountUnformatted)
    console.log(txResponse)
    const txRecepit = await txResponse.wait()
    console.log(txRecepit)
  }

  return <AmountTxForm inputKey={inputKey} onSubmit={onSubmit} />
}

const DepositForm = (props: { player: Player; decimals: string }) => {
  const { player, decimals } = props
  const inputKey = 'deposit'

  const onSubmit = async (data) => {
    const amount = data[inputKey]
    const amountUnformatted = parseUnits(amount, decimals)
    const txResponse = await player.depositTicket(amountUnformatted)
    console.log(txResponse)
    const txRecepit = await txResponse.wait()
    console.log(txRecepit)
  }

  return <AmountTxForm inputKey={inputKey} onSubmit={onSubmit} />
}

const AmountTxForm = (props) => {
  const { onSubmit, inputKey } = props

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })

  const amount = watch(inputKey)

  useEffect(() => {
    console.log('errors', errors)
  }, [errors])

  useEffect(() => {
    console.log('amount', amount)
  }, [amount])

  return (
    <div className='flex flex-col'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>{inputKey}</div>
        <input className='text-black' {...register(inputKey, { required: true })} />
        <div>
          <SquareButton type='submit'>Submit</SquareButton>
        </div>
      </form>
    </div>
  )
}

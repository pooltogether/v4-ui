import { Transaction, useTransaction } from '@pooltogether/hooks'
import {
  BlockExplorerLink,
  SquareButton,
  SquareButtonTheme,
  TokenIcon
} from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import { CountUp } from 'lib/components/CountUp'
import { ModalTitle } from 'lib/components/Modal/ModalTitle'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { ManageSheetViews, ViewProps } from '.'

interface MainViewProps extends ViewProps {
  withdrawTx: Transaction
}

export const MainView = (props: MainViewProps) => {
  const { prizePool, balances, setView, withdrawTx } = props

  const { t } = useTranslation()
  const router = useRouter()

  const { ticket } = balances

  console.log({ ticket })

  return (
    <>
      <ModalTitle
        chainId={prizePool.chainId}
        title={t('depositsOnNetwork', { network: getNetworkNiceNameByChainId(prizePool.chainId) })}
      />
      <div className='bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 rounded-xl w-full py-6 flex flex-col'>
        <span className='text-3xl mx-auto font-bold leading-none'>
          $<CountUp countTo={Number(ticket.amount)} />
        </span>
        <span className='mx-auto flex'>
          <TokenIcon
            chainId={prizePool.chainId}
            address={ticket.address}
            sizeClassName='w-4 h-4 my-auto'
          />
          <span className='font-bold opacity-50 mx-1'>
            $<CountUp countTo={Number(ticket.amount)} />
          </span>
          <span className='opacity-50'>{ticket.symbol}</span>
        </span>
      </div>

      <WithdrawReceipt withdrawTx={withdrawTx} />

      <div className='flex flex-col space-y-4'>
        <SquareButton
          onClick={() => {
            router.push({
              pathname: '/deposit',
              query: {
                ...router.query,
                network: prizePool.chainId
              }
            })
          }}
        >
          {t('deposit')}
        </SquareButton>
        <SquareButton
          onClick={() => setView(ManageSheetViews.withdraw)}
          disabled={!ticket.hasBalance}
          theme={SquareButtonTheme.tealOutline}
        >
          {t('withdraw')}
        </SquareButton>
        <button onClick={() => setView(ManageSheetViews.more)} className='font-bold'>
          {t('moreInfo')}
        </button>
      </div>
    </>
  )
}

const WithdrawReceipt = (props: { withdrawTx: Transaction }) => {
  const { withdrawTx } = props
  const { t } = useTranslation()

  if (!withdrawTx) return null

  return (
    <div className='bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 rounded-xl w-full py-6 flex justify-between'>
      <span className='font-bold'>{t('withdrawTx', 'Withdraw transaction')}</span>
      <BlockExplorerLink chainId={withdrawTx.chainId} txHash={withdrawTx.hash} />
    </div>
  )
}

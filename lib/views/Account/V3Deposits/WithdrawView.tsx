import { useV3ExitFees } from '@pooltogether/hooks'
import { ModalTitle } from '@pooltogether/react-components'
import { useTranslation } from 'react-i18next'

interface WithdrawViewProps {
  prizePool: any
}

export const WithdrawView = (props: WithdrawViewProps) => {
  const { prizePool } = props

  console.log({ prizePool })

  const { t } = useTranslation()
  const chainId = prizePool.chainId

  return (
    <>
      <ModalTitle
        chainId={chainId}
        title={t('withdrawTicker', { ticker: prizePool.tokens.token.address })}
      />
    </>
  )
}
interface ReviewViewProps {
  prizePool: any
}
const ReviewView = (props: ReviewViewProps) => {
  // const a = useV3ExitFees(
  //   prizePool.config.chainId,
  //   prizePool.prizePool.address
  //   prizePool.tokens.ticket.address
  //   usersAddress
  //   amountUnformatted
  // )
}

import { Amount } from '@pooltogether/hooks'
import { useTranslation } from 'react-i18next'

export const AmountInPrizes = (props: {
  amount: Amount
  className?: string
  numberClassName?: string
  textClassName?: string
}) => {
  const { amount, className, numberClassName, textClassName } = props
  const { t } = useTranslation()

  if (!amount) {
    return null
  }

  const { amountPretty } = amount

  return (
    <div className={className}>
      <span className={numberClassName}>${amountPretty}</span>
      <span className={textClassName}>{t('inPrizes', 'in prizes')}</span>
    </div>
  )
}

AmountInPrizes.defaultProps = {
  numberClassName: 'font-bold text-white text-xs xs:text-sm',
  textClassName: 'font-bold text-white text-xxs xs:text-xs ml-1 opacity-60'
}

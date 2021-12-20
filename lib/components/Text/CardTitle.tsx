import { DetailedHTMLProps, HTMLAttributes } from 'react'

interface CardTitleProps {
  title: string
  secondary?: string
}

export const CardTitle = (props: CardTitleProps) => (
  <div className='flex space-x-2 items-center'>
    <CardTitle>V3 {t('deposits')}</CardTitle>
    <h3 {...props} />
    <V3DepositAmount amountPretty={data.totalValueUsd.amountPretty} />
  </div>
)

export const CardSecondary = (
  props: DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
) => (
  <h3
    {...props}
    className={classNames('opacity-50 font-light text-base xs:text-xl', props.className)}
  />
)

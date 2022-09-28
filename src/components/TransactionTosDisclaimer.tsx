import { Trans, useTranslation } from 'next-i18next'

export const TransactionTosDisclaimer: React.FC<{
  buttonTexti18nKey: string
  className?: string
}> = (props) => {
  const { t } = useTranslation()
  return (
    <p className={props.className}>
      <Trans
        i18nKey='buttonClickTermsAndDisclaimerBlurb'
        values={{
          buttonText: t(props.buttonTexti18nKey)
        }}
        components={{
          termsLink: (
            <a
              className='text-pt-teal transition hover:opacity-70 underline'
              href='https://pooltogether.com/terms/'
              target='_blank'
              rel='noreferrer'
            />
          ),
          disclaimerLink: (
            <a
              className='text-pt-teal transition hover:opacity-70 underline'
              href='https://pooltogether.com/protocol-disclaimer/'
              target='_blank'
              rel='noreferrer'
            />
          )
        }}
      />
    </p>
  )
}

TransactionTosDisclaimer.defaultProps = {
  className: 'text-xxs opacity-70'
}

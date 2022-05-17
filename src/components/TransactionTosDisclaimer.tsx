import { Trans } from 'react-i18next'

export const TransactionTosDisclaimer: React.FC<{ className?: string }> = (props) => (
  <p className={props.className}>
    <Trans
      i18nKey='termsAndDisclaimerBlurb'
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

TransactionTosDisclaimer.defaultProps = {
  className: 'text-xxs opacity-70'
}

import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

export const OddsDisclaimer = (props: {
  textClassName?: string
  linkClassName?: string
  className?: string
}) => {
  const { t } = useTranslation()
  return (
    <span className={classNames(props.textClassName, props.className)}>
      *<span>{t('oddsDisclaimer')}</span>
      <a
        href='https://docs.pooltogether.com/welcome/faq#prizes-and-winning'
        target='_blank'
        rel='noopener noreferrer'
        className={props.linkClassName}
      >
        {t('readMore')}
      </a>
    </span>
  )
}

OddsDisclaimer.defaultProps = {
  textClassName: 'opacity-40 text-xxxs text-center mx-auto',
  linkClassName: 'underline ml-1 text-xxxs'
}

import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

export const OddsDisclaimer = (props: { className?: string }) => {
  const { t } = useTranslation()
  return (
    <span className={classNames('opacity-40 text-xxxs text-center mx-auto', props.className)}>
      * <span>{t('oddsDisclaimer')}</span>
      <a
        href='https://docs.pooltogether.com/welcome/faq#prizes-and-winning'
        target='_blank'
        rel='noopener noreferrer'
        className='underline ml-1 text-xxxs'
      >
        {t('readMore')}
      </a>
    </span>
  )
}

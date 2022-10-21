import classNames from 'classnames'
import { useTranslation } from 'next-i18next'

export const ShowMoreTextButton = (
  props: {
    showMore: boolean
    setShowMore: (showMore: boolean) => void
  } & JSX.IntrinsicElements['button']
) => {
  const { t } = useTranslation()
  return (
    <button
      {...props}
      className={classNames('opacity-70 hover:opacity-100 transition-opacity', props.className)}
      onClick={() => props.setShowMore(!props.showMore)}
    >
      {props.showMore ? t('showLess') : t('showMore')}
    </button>
  )
}

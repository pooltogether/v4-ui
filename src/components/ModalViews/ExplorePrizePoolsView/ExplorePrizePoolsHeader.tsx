import { PoolTogetherExplainerWithStats } from '@components/PoolTogetherExplainerWithStats'
import { useCachedDismiss } from '@hooks/useCachedDismiss'
import { Button, ButtonSize, ButtonTheme, ExternalLink } from '@pooltogether/react-components'
import { useTranslation } from 'next-i18next'

export const ExplorePrizePoolsHeader = () => {
  const { t } = useTranslation()
  const { dismissed, dismiss, enable } = useCachedDismiss('explore-prize-pools-header')

  if (dismissed) {
    return (
      <Button
        onClick={enable}
        className='mb-6 opacity-75 hover:opacity-100'
        size={ButtonSize.sm}
        theme={ButtonTheme.transparent}
      >
        {t('howDoesThisWork')}
      </Button>
    )
  }

  return (
    <div className='flex flex-col sm:flex-row gap-2 sm:gap-4 mb-8 sm:mb-8 px-3 py-2 bg-white bg-opacity-100 dark:bg-actually-black dark:bg-opacity-10 rounded-lg'>
      <div className='opacity-80'>
        <PoolTogetherExplainerWithStats />{' '}
        <ExternalLink underline href={'https://docs.pooltogether.com/welcome/faq'}>
          {t('learnMore')}
        </ExternalLink>
      </div>
      <Button
        onClick={dismiss}
        className='mt-auto ml-auto flex-shrink-0 opacity-75 hover:opacity-100'
        size={ButtonSize.sm}
        theme={ButtonTheme.transparent}
      >
        {t('dismiss')}
      </Button>
    </div>
  )
}

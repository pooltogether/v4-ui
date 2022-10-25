import { PoolTogetherExplainerWithStats } from '@components/PoolTogetherExplainerWithStats'
import { ExternalLink, LinkTheme } from '@pooltogether/react-components'
import { useTranslation } from 'next-i18next'

export const ExplorePrizePoolsHeader = () => {
  const { t } = useTranslation()
  return (
    <div className='mb-8 sm:mb-12 opacity-80'>
      <PoolTogetherExplainerWithStats />{' '}
      <ExternalLink underline href={'https://docs.pooltogether.com/welcome/faq'}>
        {t('learnMore')}
      </ExternalLink>
    </div>
  )

  // TODO: Make this dismissable info box prettier
  // const { dismissed, dismiss, enable } = useCachedDismiss('explore-prize-pools-header')
  // if (dismissed) {
  //   return (
  //     <button onClick={enable} className='mb-4 opacity-75 hover:opacity-100'>
  //       How does this work?
  //     </button>
  //   )
  // }
  // return (
  //   <div className='mb-12'>
  //     <div className='opacity-80'>
  //       <PoolTogetherExplainerWithStats />
  //     </div>
  //     <Button
  //       onClick={dismiss}
  //       className='ml-auto'
  //       size={ButtonSize.sm}
  //       theme={ButtonTheme.transparent}
  //     >
  //       Dismiss
  //     </Button>
  //   </div>
  // )
}

import { Button, ButtonTheme, ButtonRadius } from '@pooltogether/react-components'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { networkCarouselAutoplayAtom } from '../NetworkCarousel'
import { DepositModal } from './DepositModal'
import { RewardsBanners } from './RewardsBanners'

export const DepositTrigger: React.FC = () => {
  const { t } = useTranslation()
  const [, setAutoplay] = useAtom(networkCarouselAutoplayAtom)
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div>
      <Button
        theme={ButtonTheme.pink}
        radius={ButtonRadius.full}
        className='mx-auto w-full max-w-xs transform delay-150 hover:scale-105 transition mb-4'
        onClick={() => {
          setAutoplay(false)
          setIsOpen(true)
        }}
      >
        {/* {t('depositToWin', 'Deposit to win')} */}
        {t('getStarted', 'Get started')}
      </Button>
      <RewardsBanners />
      <DepositModal
        isOpen={isOpen}
        closeModal={() => {
          setAutoplay(true)
          setIsOpen(false)
        }}
      />
    </div>
  )
}

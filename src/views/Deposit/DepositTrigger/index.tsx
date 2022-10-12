import { Button, ButtonTheme, ButtonRadius } from '@pooltogether/react-components'
import classNames from 'classnames'
import { useAtom } from 'jotai'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PrizePoolNetworkCarouselAutoplayAtom } from '../PrizePoolNetworkCarousel'
import { DepositModal } from './DepositModal'
import { HelpButtons } from './HelpButtons'
import { RewardsBanners } from './RewardsBanners'

export const DepositTrigger = (props: { className?: string }) => {
  const { className } = props
  const { t } = useTranslation()
  const [, setAutoplay] = useAtom(PrizePoolNetworkCarouselAutoplayAtom)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className={classNames('flex flex-col space-y-4', className)}>
        <Button
          theme={ButtonTheme.pinkToYellow}
          radius={ButtonRadius.full}
          className='mx-auto w-full max-w-xs transform delay-150 hover:scale-105 transition'
          onClick={() => {
            setAutoplay(false)
            setIsOpen(true)
          }}
        >
          {t('depositToWin', 'Deposit to win')}
          {/* {t('getStarted', 'Get started')} */}
        </Button>
        <HelpButtons />
      </div>
      <DepositModal
        isOpen={isOpen}
        closeModal={() => {
          setAutoplay(true)
          setIsOpen(false)
        }}
      />
    </>
  )
}

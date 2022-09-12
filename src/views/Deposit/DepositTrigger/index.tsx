import { Button, ButtonTheme, ButtonRadius } from '@pooltogether/react-components'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DepositModal } from './DepositModal'

export const DepositTrigger: React.FC = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <Button
        theme={ButtonTheme.pink}
        radius={ButtonRadius.full}
        className='mx-auto w-full max-w-xs transform delay-150 hover:scale-105 xs:hover:scale-110 sm:hover:scale-125  transition '
        onClick={() => setIsOpen(true)}
      >
        {t('depositToWin', 'Deposit to win')}
      </Button>
      <DepositModal isOpen={isOpen} closeModal={() => setIsOpen(false)} />
    </>
  )
}

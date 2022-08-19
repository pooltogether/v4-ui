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
        className='mx-auto w-full max-w-xs'
        onClick={() => setIsOpen(true)}
      >
        {t('depositToWin', 'Deposit to win')}
      </Button>
      <DepositModal isOpen={isOpen} closeModal={() => setIsOpen(false)} />
    </>
  )
}

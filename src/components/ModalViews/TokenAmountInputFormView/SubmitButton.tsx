import { TxButton } from '@components/Input/TxButton'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { ButtonRadius, ButtonTheme } from '@pooltogether/react-components'
import { useFormState } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

export interface SubmitButtonProps {
  connectWallet?: () => void
  theme?: ButtonTheme
  children?: React.ReactNode
}

export const SubmitButton: React.FC<SubmitButtonProps> = (props) => {
  const { connectWallet, theme, children } = props
  const { t } = useTranslation()
  const { chainId } = useSelectedChainId()

  const { isValid, isDirty } = useFormState()

  return (
    <TxButton
      disabled={!isValid && isDirty}
      className='w-full'
      type='submit'
      chainId={chainId}
      connectWallet={connectWallet}
      radius={ButtonRadius.full}
      theme={theme}
    >
      {children || t('review', 'Review')}
    </TxButton>
  )
}

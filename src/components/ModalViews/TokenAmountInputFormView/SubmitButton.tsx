import { TxButton } from '@components/Input/TxButton'
import { useSelectedChainId } from '@hooks/useSelectedChainId'
import { ButtonRadius } from '@pooltogether/react-components'
import { useFormState } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

export interface SubmitButtonProps {
  connectWallet?: () => void
}

export const SubmitButton: React.FC<SubmitButtonProps> = (props) => {
  const { connectWallet, children } = props
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
    >
      {children || t('reviewTransaction', 'Review transaction')}
    </TxButton>
  )
}

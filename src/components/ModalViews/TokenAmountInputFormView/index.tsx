import { ViewProps } from '@pooltogether/react-components'
import { FormProvider, useForm } from 'react-hook-form'
import { InfoBox, InfoBoxProps } from './InfoBox'
import { SubmitButton, SubmitButtonProps } from './SubmitButton'
import { TokenAmountInput, TokenAmountInputProps } from './TokenAmountInput'

export interface TokenAmountFormValues {
  [key: string]: string
}

export interface TokenAmountInputFormViewProps
  extends ViewProps,
    SubmitButtonProps,
    TokenAmountInputProps {
  infoListItems?: React.ReactNode
  carouselChildren?: React.ReactNode
  formKey: string
  submitButtonContent?: React.ReactNode
  defaultValue?: string
  handleSubmit: (values: TokenAmountFormValues) => void
}

// TODO: Add amount to query params so an input amount persists after connecting a wallet
export const TokenAmountInputFormView: React.FC<TokenAmountInputFormViewProps> = (props) => {
  const {
    chainId,
    token,
    formKey,
    useValidationRules,
    infoListItems,
    carouselChildren,
    connectWallet,
    submitButtonContent,
    children,
    handleSubmit: _handleSubmit,
    defaultValue
  } = props

  const methods = useForm<TokenAmountFormValues>({
    mode: 'onChange',
    defaultValues: { [formKey]: defaultValue },
    shouldUnregister: true
  })

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(_handleSubmit)}
        className='flex w-full h-full flex-col justify-between space-y-6'
      >
        <div className='flex flex-col space-y-2'>
          <TokenAmountInput
            chainId={chainId}
            token={token}
            useValidationRules={useValidationRules}
            formKey={formKey}
          />
          {children}
        </div>
        <div className='space-y-6'>
          {(!!infoListItems || !!carouselChildren) && (
            <InfoBox infoListItems={infoListItems} carouselChildren={carouselChildren} />
          )}
          <SubmitButton connectWallet={connectWallet}>{submitButtonContent}</SubmitButton>
        </div>
      </form>
    </FormProvider>
  )
}

TokenAmountInputFormView.defaultProps = {
  defaultValue: ''
}

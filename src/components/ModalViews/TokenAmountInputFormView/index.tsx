import { ViewProps } from '@pooltogether/react-components'
import { FormProvider, useForm } from 'react-hook-form'
import { InfoBox, InfoBoxProps } from './InfoBox'
import { SubmitButton, SubmitButtonProps } from './SubmitButton'
import { TokenAmountInput, TokenAmountInputProps } from './TokenAmountInput'

export enum FORM_KEY {
  'amount' = 'amount'
}

export interface TokenAmountFormValues {
  [FORM_KEY.amount]: string
}

export interface TokenAmountInputFormViewProps
  extends ViewProps,
    InfoBoxProps,
    SubmitButtonProps,
    TokenAmountInputProps {
  defaultValue?: string
  handleSubmit: (values: TokenAmountFormValues) => void
}

// TODO: Add amount to query params so an input amount persists after connecting a wallet
export const TokenAmountInputFormView: React.FC<TokenAmountInputFormViewProps> = (props) => {
  const {
    chainId,
    token,
    useValidationRules,
    infoListItems,
    carouselChildren,
    connectWallet,
    children,
    handleSubmit: _handleSubmit,
    defaultValue
  } = props

  const methods = useForm<TokenAmountFormValues>({
    mode: 'onChange',
    defaultValues: { [FORM_KEY.amount]: defaultValue },
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
          />
          {children}
        </div>
        <div className='space-y-6'>
          <InfoBox infoListItems={infoListItems} carouselChildren={carouselChildren} />
          <SubmitButton connectWallet={connectWallet} />
        </div>
      </form>
    </FormProvider>
  )
}

TokenAmountInputFormView.defaultProps = {
  defaultValue: ''
}

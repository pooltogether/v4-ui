import React, { useContext } from 'react'

import { useTranslation } from 'lib/../i18n'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { Button } from 'lib/components/Button'
import { PTHint } from 'lib/components/PTHint'

import PoolTogetherTrophyDetailed from 'assets/images/pooltogether-trophy--detailed.svg'

export function SignInForm(props) {
  const { t } = useTranslation()
  // const { handleSubmit, register, errors, formState } = useForm({ mode: 'onBlur' })

  const { hideImg, descriptionClassName, postSignInCallback } = props

  const { connectWallet } = useContext(AuthControllerContext)

  // const onSubmit = (values) => {
  //   if (formState.isValid) {
  //     authControllerContext.signInMagic(values.email, postSignInCallback)
  //   }
  // }

  return (
    <>
      <div className='text-inverse'>
        {!hideImg && (
          <>
            <img src={PoolTogetherTrophyDetailed} className='mx-auto mb-6 w-16 xs:w-1/12' />
          </>
        )}

        <h5 className={descriptionClassName}>{t('connectAWalletToManageTicketsAndRewards')}</h5>

        <Button
          textSize='lg'
          onClick={(e) => {
            e.preventDefault()
            connectWallet(postSignInCallback)
          }}
        >
          {t('connectWallet')}
        </Button>

        <PTHint
          title='Ethereum'
          className='mt-4 mx-auto w-48'
          tip={
            <>
              <div className='my-2 text-xs sm:text-sm'>{t('whatIsEthereumOne')}</div>
              <div className='text-xs sm:text-sm'>{t('whatIsEthereumTwo')}</div>
            </>
          }
        >
          <span className='font-bold text-caption w-48'>{t('whatsAnEthereum')}</span>
        </PTHint>
      </div>

      {/* <div
      className='font-bold mb-2 py-2 text-xl sm:text-3xl lg:text-5xl text-inverse'
    >
      Enter your email address to continue.
    </div>

    <form
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className='w-full mx-auto'>
        <TextInputGroup
          id='email'
          name='email'
          type='email'
          register={register}
          label={'Email address:'}
          placeholder='Your email'
          required='Email address required'
        />
      </div>
      <div className='text-red'>
        {errors.email && errors.email.message}
      </div>

      <div
        className='my-5'
      >
        <Button
          textSize='lg'
          disabled={!formState.isValid}
          // type='submit'
        >
          Continue
        </Button>
      </div>
    </form> 

    <div>
      <button
        onClick={(e) => {
          e.preventDefault()
          connectWallet(postSignInCallback)
        }}
        className='font-bold inline mb-2 py-2 text-sm sm:text-base text-primary-soft hover:text-primary trans border-b-2 border-transparent hover:border-secondary'
      >
        or connect to MetaMask, etc.
      </button>
    </div>
    */}
    </>
  )
}

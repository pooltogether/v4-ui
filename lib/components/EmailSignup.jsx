import React, { useState } from 'react'
import classnames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useForm } from 'react-hook-form'

import { axiosInstance } from 'lib/axiosInstance'
import { useTranslation } from 'react-i18next'
import { TextInputGroup } from 'lib/components/TextInputGroup'
import { poolToast } from 'lib/utils/poolToast'

const MAILCHIMP_LOCAL_URI = `/.netlify/functions/mailchimp-signup`

export function EmailSignup(props) {
  const { t } = useTranslation()
  const { handleSubmit, register, watch, formState } = useForm({ mode: 'all' })

  const [success, setSuccess] = useState(success)

  const watchEmail = watch('email')

  const onSubmit = async () => {
    if (formState.isValid) {
      let response

      try {
        const listId = process.env.NEXT_JS_MAILCHIMP_LIST_GENERAL_ID

        if (!listId) {
          throw new Error('No listId supplied')
        }

        response = await axiosInstance.post(MAILCHIMP_LOCAL_URI, {
          email: watchEmail,
          listId
        })

        if (response.status < 400) {
          setSuccess(true)
        }
      } catch (error) {
        console.warn(error)
        console.error(error.message)
        poolToast.error(t('mailchimpSubscribeErrorMsg'))
      }
    }
  }

  return (
    <>
      <div className='flex flex-col items-start justify-start w-full'>
        <form onSubmit={handleSubmit(onSubmit)} className='w-full'>
          <TextInputGroup
            alignLeft
            small
            marginClasses='m-0'
            paddingClasses='px-8 py-2'
            borderClasses='border-0'
            bgClasses='bg-primary'
            id='email'
            type='email'
            name='email'
            register={register}
            placeholder={t('yourEmailAddress')}
            inlineButton={
              <>
                <button className='flex w-full items-center text-highlight-1 hover:text-darkened focus:text-darkened active:text-darkened font-bold tracking-wider bg-primary hover:bg-highlight-2 active:bg-highlight-2 focus:bg-highlight-2 py-2 px-3 rounded-full trans trans-fastest'>
                  {success ? (
                    <FeatherIcon
                      strokeWidth='0.15rem'
                      icon='check-circle'
                      className='mr-2 stroke-current w-4 h-4 relative'
                      style={{
                        top: 1
                      }}
                    />
                  ) : (
                    <>
                      <FeatherIcon
                        strokeWidth='0.15rem'
                        icon='arrow-right'
                        className='mr-2 stroke-current w-4 h-4 relative'
                        style={{
                          top: 1
                        }}
                      />{' '}
                      {t('getNotified')}
                    </>
                  )}
                </button>
              </>
            }
          />
        </form>

        <div className={`text-highlight-1 text-xs sm:text-sm lg:text-lg mb-3 text-left`}>
          {success && t('thankYouYouWillBeNotified')}
        </div>
      </div>
    </>
  )
}

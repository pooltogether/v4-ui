import React from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { ThemedClipSpinner } from '@pooltogether/react-components'

interface ModalLoadingGateProps {
  className?: string
}

export const ModalLoadingGate = (props: ModalLoadingGateProps) => {
  const { className } = props

  const { t } = useTranslation()

  return (
    <div className={classNames(className, 'flex flex-col text-accent-1')}>
      <ThemedClipSpinner className='mx-auto mb-8' sizeClassName='w-10 h-10' />

      <div className='text-white opacity-60'>
        <p className='mb-4 text-center mx-8'>
          {t('wereGettingMoreData', `We're getting some more data to make sure you can deposit.`)}
        </p>
        <p className='text-center mx-8'>
          {t(
            'thisMightTakeAFewSecondsAndYouMayNeedToReload',
            `This might take a few seconds, and you may need to reload the page.`
          )}
        </p>
      </div>

      <button className=' underline' onClick={() => window.location.reload()}>
        {t('reloadPage', 'Reload page')}
      </button>
    </div>
  )
}

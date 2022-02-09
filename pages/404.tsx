import { ErrorLinks } from 'lib/views/ErrorPage'
import { useTranslation } from 'react-i18next'

const Custom404 = () => {
  const { t } = useTranslation()

  return (
    <div
      className='flex flex-col w-full'
      style={{
        minHeight: '100vh'
      }}
    >
      <div className='content mx-auto max-w-sm' style={{ maxWidth: 700 }}>
        <div className='my-0 text-inverse pt-32 px-2 xs:pt-32 space-y-4'>
          <h1 className=''>🤔</h1>
          <h2 className=''>404 - {t('pageNotFound', 'Page not found')}</h2>
          <h6 className='text-accent-1'>
            {t('lookingForSomethingElse', 'Looking for something else?')}
          </h6>
          <ErrorLinks />
        </div>
      </div>
    </div>
  )
}

export default Custom404

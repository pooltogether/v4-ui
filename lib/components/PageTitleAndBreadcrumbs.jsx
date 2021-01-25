import React from 'react'
import Link from 'next/link'

import { useTranslation } from 'lib/../i18n'
import { PoolCurrencyIcon } from 'lib/components/PoolCurrencyIcon'
import { Chip } from 'lib/components/Chip'

export const PageTitleAndBreadcrumbs = (props) => {
  const { t } = useTranslation()

  const { breadcrumbs, title, pool } = props

  return (
    <div className='flex flex-col items-start justify-between w-full leading-none mb-4 sm:mb-8'>
      <div className='inline-block text-left text-xl sm:text-3xl font-bold text-accent-2 relative'>
        {title}
      </div>
      <div
        className='inline-block text-left text-caption-2 relative uppercase mt-3'
        style={{
          left: 1,
          bottom: 2
        }}
      >
        {breadcrumbs?.map((crumb, index) => (
          <span key={`crumb-${index}`}>
            {crumb.href && crumb.as ? (
              <>
                <Link href={crumb.href} as={crumb.as} shallow>
                  <a className='border-b border-accent-3'>{crumb.name}</a>
                </Link>
              </>
            ) : (
              <>
                <span>{crumb.name}</span>
              </>
            )}
            {index + 1 !== breadcrumbs.length && <> &gt; </>}
          </span>
        ))}
      </div>
    </div>
  )
}

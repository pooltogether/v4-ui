import React from 'react'
import { omit } from 'lodash'
import { useRouter } from 'next/router'

import { Button } from '@pooltogether/react-components'
import { ButtonLink } from '@pooltogether/react-components'
import { PTHint } from 'lib/components/PTHint'

export function ButtonTx(props) {
  const { children, usersAddress } = props

  const router = useRouter()

  let newProps = omit(props, ['usersAddress'])

  const button = (
    <Button {...newProps} disabled={!usersAddress}>
      {children}
    </Button>
  )

  return (
    <>
      {!usersAddress ? (
        <>
          <PTHint
            title='Connect a wallet'
            tip={
              <>
                <div className='my-2 text-xs sm:text-sm'>You do not have a wallet connected.</div>
                <div className='my-2 text-xs sm:text-sm'>
                  Please connect a wallet before submitting transactions.
                </div>
              </>
            }
          >
            {button}
          </PTHint>
        </>
      ) : (
        button
      )}
    </>
  )
}

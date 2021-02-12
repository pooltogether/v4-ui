import React from 'react'
import { useController, useFormContext } from 'react-hook-form'

import { useTranslation } from 'lib/../i18n'
import { Button } from 'lib/components/Button'
import { Card } from 'lib/components/Card'
import { Action } from 'lib/components/proposals/Action'
import { useGovernorAlpha } from 'lib/hooks/useGovernorAlpha'
import { usePrizePools } from 'lib/hooks/usePrizePools'

export const ActionsCard = (props) => {
  const { disabled } = props
  const { t } = useTranslation()
  const { isFetched: prizePoolsIsFetched } = usePrizePools()
  const { data: governorAlpha, isFetched: governorAlphaIsFetched } = useGovernorAlpha()

  const name = 'actions'
  const { control } = useFormContext()

  const {
    field: { onChange, value: actions }
  } = useController({
    name,
    control,
    defaultValue: [
      {
        id: Date.now()
      }
    ]
  })

  if (!prizePoolsIsFetched || !governorAlphaIsFetched) return null

  const { proposalMaxOperations } = governorAlpha

  return (
    <Card>
      <h4 className='mb-6'>{t('actions')}</h4>
      <p className='mb-4'>{t('actionCardDescription')}</p>
      {!disabled &&
        actions.map((action, index) => {
          const setAction = (action) => {
            const newActions = [...actions]
            newActions.splice(index, 1, action)
            onChange(newActions)
          }

          const deleteAction = () => {
            const newActions = [...actions]
            newActions.splice(index, 1)
            onChange(newActions)
          }
          return (
            <Action
              key={action.id}
              action={action}
              index={index}
              setAction={setAction}
              deleteAction={deleteAction}
              hideRemoveButton={actions.length === 1 && index === 0}
            />
          )
        })}
      <Button
        className='mt-8'
        onClick={(e) => {
          e.preventDefault()
          onChange([
            ...actions,
            {
              id: Date.now()
            }
          ])
        }}
        disabled={actions.length >= proposalMaxOperations || disabled}
      >
        {t('addAnotherAction')}
      </Button>
    </Card>
  )
}

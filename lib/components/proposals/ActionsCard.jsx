import { Button } from 'lib/components/Button'
import { Card } from 'lib/components/Card'
import { Action } from 'lib/components/proposals/Action'
import { useGovernorAlpha } from 'lib/hooks/useGovernorAlpha'
import { usePrizePools } from 'lib/hooks/usePrizePools'
import React from 'react'
import { useController, useFormContext } from 'react-hook-form'

export const ActionsCard = () => {
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
    ],
    rules: {
      validate: validateAction
    }
  })

  if (!prizePoolsIsFetched || !governorAlphaIsFetched) return null

  const { proposalMaxOperations } = governorAlpha

  return (
    <Card>
      <h4 className='mb-6'>Actions</h4>
      <p className='mb-4'>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
      </p>
      {actions.map((action, index) => {
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
        disabled={actions.length >= proposalMaxOperations}
      >
        Add another action
      </Button>
    </Card>
  )
}

const validateAction = (action) => {
  // TODO: Validate action
  return true
}

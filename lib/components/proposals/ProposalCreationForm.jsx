import { useDebouncedFn } from 'beautiful-react-hooks'
import classnames from 'classnames'
import { Card } from 'lib/components/Card'
import { ActionsCard } from 'lib/components/proposals/ActionsCard'
import { TextInputGroup } from 'lib/components/TextInputGroup'
import { useUserCanCreateProposal } from 'lib/hooks/useUserCanCreateProposal'
import React from 'react'
import { useState } from 'react'
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import { useTranslation } from 'lib/../i18n'

export const ProposalCreationForm = () => {
  const { userCanCreateProposal } = useUserCanCreateProposal()
  const formMethods = useForm()

  const [actions, setActions] = useState([
    {
      id: Date.now()
    }
  ])

  return (
    <>
      <FormProvider {...formMethods}>
        <button onClick={() => console.log(formMethods.getValues())}>TEST: Log Form Values</button>
        <button onClick={() => console.log(formMethods.formState)}>TEST: Log State</button>
        <button onClick={() => formMethods.trigger()}>Trigger Validation</button>
        <ActionsCard actions={actions} setActions={setActions} />
        <TitleCard disabled={!userCanCreateProposal} />
        <DescriptionCard disabled={!userCanCreateProposal} />
      </FormProvider>
    </>
  )
}

const TitleCard = (props) => {
  const { disabled } = props
  
  const { t } = useTranslation()
  const { register } = useFormContext()

  return (
    <Card>
      <h4 className='mb-6'>{t('title')}</h4>
      <p className='mb-4'>
        {t('theTitleIsDescription')}
      </p>
      <TextInputGroup
        disabled={disabled}
        placeholder={t('enterTheTitleOfYourProposal')}
        id='_proposalTitle'
        label={t('proposalTitle')}
        name='title'
        required
        register={register}
      />
    </Card>
  )
}

const DescriptionCard = (props) => {
  const { disabled } = props
  
  const { t } = useTranslation()
  const { register, control } = useFormContext()
  const name = 'description'
  const text = useWatch({ control, name, defaultValue: '' })

  return (
    <Card>
      <h4 className='mb-6'>{t('description')}</h4>
      <p className='mb-4'>
        {t('theDescriptionShouldPresentInFullDescription')}
      </p>
      <MarkdownInputArea name={name} text={text} register={register} disabled={disabled} />
    </Card>
  )
}

const MarkdownInputArea = (props) => {
  const { text, name, register, disabled } = props

  const { t } = useTranslation()

  const tabs = [
    {
      title: t('write'),
      view: (
        <TextArea
          placeholder={t('addTheProposalDetailsHere')}
          rows={15}
          disabled={disabled}
          name='description'
          required
          register={register}
        />
      )
    },
    {
      title: t('preview'),
      view: <MarkdownPreview text={text} />
    }
  ]

  return <TabbedView tabs={tabs} />
}

const TextArea = (props) => {
  const { register, required, pattern, validate, classNames, ...textAreaProps } = props
  return (
    <textarea
      className={classnames('p-1 bg-body text-inverse w-full resize-none', classNames)}
      ref={register({ required, pattern, validate })}
      {...textAreaProps}
    />
  )
}

const MarkdownPreview = (props) => {
  const { text } = props

  return (
    <ReactMarkdown
      plugins={[gfm]}
      className='description whitespace-pre-wrap break-word h-96 overflow-y-auto'
      children={text}
    />
  )
}

const TabbedView = (props) => {
  const { tabs, initialTabIndex } = props
  const { t } = useTranslation()
  const [selectedTabIndex, setSelectedTabIndex] = useState(initialTabIndex)
  
  return (
    <>
      <div className='flex'>
        {tabs.map((tab, index) => (
          <Tab
            key={`${tab.title}-${index}-tab`}
            tab={tab.title}
            isSelected={selectedTabIndex === index}
            setTab={() => setSelectedTabIndex(index)}
          />
        ))}
      </div>
      <div className='bg-body p-8 border border-accent-3 rounded-b-lg'>
        {tabs.map((tab, index) => (
          <div
            key={`${tab.title}-${index}-view`}
            className={classnames({ hidden: selectedTabIndex !== index })}
          >
            {tab.view}
          </div>
        ))}
      </div>
    </>
  )
}

TabbedView.defaultProps = {
  initialTabIndex: 0
}

const Tab = (props) => {
  const { tab, setTab, isSelected } = props
  return (
    <div
      className={classnames('p-4 sm:px-8 sm:py-4 font-bold cursor-pointer', {
        'bg-body border-accent-3 border-t border-l border-r rounded-t-lg': isSelected
      })}
      onClick={(e) => {
        e.preventDefault()
        setTab()
      }}
    >
      {tab}
    </div>
  )
}

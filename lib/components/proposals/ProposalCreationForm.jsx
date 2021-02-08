import { useDebouncedFn } from 'beautiful-react-hooks'
import classnames from 'classnames'
import { Card } from 'lib/components/Card'
import { ActionsCard } from 'lib/components/proposals/ActionsCard'
import { TextInputGroup } from 'lib/components/TextInputGroup'
import { useUserCanCreateProposal } from 'lib/hooks/useUserCanCreateProposal'
import React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'

export const ProposalCreationForm = () => {
  const { userCanCreateProposal } = useUserCanCreateProposal()
  const { handleSubmit, register, watch, formState } = useForm({ mode: 'all' })

  const [actions, setActions] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  return (
    <>
      <ActionsCard />
      <TitleCard
        title={title}
        setTitle={setTitle}
        register={register}
        disabled={!userCanCreateProposal}
      />
      <DescriptionCard
        description={description}
        setDescription={setDescription}
        disabled={!userCanCreateProposal}
      />
    </>
  )
}

const TitleCard = (props) => {
  const { title, setTitle: setParentTitle, register, disabled } = props

  const [localTitle, setLocalTitle] = useState(title)
  const setTitleDebounced = useDebouncedFn(setParentTitle, 200, null, [setParentTitle])

  return (
    <Card className='text-accent-1'>
      <h3 className='mb-6'>Title</h3>
      <p className='mb-4'>
        The title is the first introduction of your proposal to the voters. Make sure to make it
        clear and to the point.
      </p>
      <TextInputGroup
        disabled={disabled}
        placeholder='Enter the title of your proposal'
        id='_proposalTitle'
        name='Proposal Title'
        label='Proposal title'
        required
        register={register}
        onChange={(e) => {
          setLocalTitle(e.target.value)
          setTitleDebounced(e.target.value)
        }}
        value={localTitle}
      />
    </Card>
  )
}

const DescriptionCard = (props) => {
  const { description, setDescription: setParentDescription, register, disabled } = props

  const [localDescription, setLocalDescription] = useState(description)
  const setDescriptionDebounced = useDebouncedFn(setParentDescription, 200, null, [
    setParentDescription
  ])

  const setDescription = (description) => {
    setLocalDescription(description)
    setDescriptionDebounced(description)
  }

  return (
    <Card className='text-accent-1'>
      <h3 className='mb-6'>Description</h3>
      <p className='mb-4'>
        The description should present in full detail what the actions of the proposal are doing.
        This is where voters will educate themselves on what they are voting on.
      </p>
      <MarkdownInputArea
        text={localDescription}
        setText={setDescription}
        register={register}
        disabled={disabled}
        name='Proposal Description'
      />
    </Card>
  )
}

const MarkdownInputArea = (props) => {
  const { text, setText, register, disabled } = props

  const tabs = [
    {
      title: 'Write',
      view: (
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Add the proposal details here'
          register={register}
          rows={15}
          disabled={disabled}
        />
      )
    },
    {
      title: 'Preview',
      view: <MarkdownPreview text={text} />
    }
  ]

  return <TabbedView tabs={tabs} />
}

const TextArea = (props) => {
  const { register, text, setText, classNames, ...textAreaProps } = props
  return (
    <textarea
      className={classnames('p-1 bg-body text-inverse w-full resize-none', classNames)}
      {...textAreaProps}
      ref={register}
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
  const [selectedTabIndex, setSelectedTabIndex] = useState(initialTabIndex)
  return (
    <>
      <div className='flex'>
        {tabs.map((tab, index) => (
          <Tab
            key={`${tab.title}-${index}`}
            tab={tab.title}
            isSelected={selectedTabIndex === index}
            setTab={() => setSelectedTabIndex(index)}
          />
        ))}
      </div>
      <div className='bg-body p-8 border border-accent-3 rounded-b-lg'>
        {tabs[selectedTabIndex].view}
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

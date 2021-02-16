import React, { useEffect, useState } from 'react'
import FeatherIcon from 'feather-icons-react'
import classnames from 'classnames'
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import { Dialog } from '@reach/dialog'

import GovernorAlphaABI from 'abis/GovernorAlphaABI'
import { Card } from 'lib/components/Card'
import { ActionsCard } from 'lib/components/proposals/ActionsCard'
import { TextInputGroup } from 'lib/components/TextInputGroup'
import { useUserCanCreateProposal } from 'lib/hooks/useUserCanCreateProposal'
import { useTranslation } from 'lib/../i18n'
import { Button } from 'lib/components/Button'
import { EtherscanAddressLink } from 'lib/components/EtherscanAddressLink'
import { shorten } from 'lib/utils/shorten'
import { useSendTransaction } from 'lib/hooks/useSendTransaction'
import { useTransaction } from 'lib/hooks/useTransaction'
import { CONTRACT_ADDRESSES } from 'lib/constants'
import { useContext } from 'react'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { ethers } from 'ethers'
import { TxStatus } from 'lib/components/TxStatus'
import { Banner } from 'lib/components/Banner'
import { useCallback } from 'react'

export const ProposalCreationForm = () => {
  const { userCanCreateProposal } = useUserCanCreateProposal()
  const formMethods = useForm({ mode: 'onSubmit', shouldFocusError: false })
  const [showSummary, setShowSummary] = useState(false)

  const [showModal, setShowModal] = useState(false)

  const { chainId } = useContext(AuthControllerContext)
  const governanceAddress = CONTRACT_ADDRESSES[chainId].GovernorAlpha

  const [txId, setTxId] = useState(0)
  const sendTx = useSendTransaction()
  const tx = useTransaction(txId)

  const onCancelled = () => setShowModal(false)

  const onSubmit = async (data) => {
    console.log('Submit', data)

    const params = getProposeParamsFromForm(data)
    console.log('params', params)
    const txId = await sendTx('Propose', GovernorAlphaABI, governanceAddress, 'propose', params, {
      onCancelled
    })
    console.log(txId)
    setTxId(txId)
    setShowModal(true)
  }
  const onError = (data) => console.log('Error', data)

  const closeModal = useCallback(() => {
    if (tx && !tx?.inWallet) {
      setShowModal(false)
      setShowSummary(false)
      formMethods.reset()
    }
  }, [tx])

  return (
    <>
      <ProposalTransactionModal tx={tx} isOpen={showModal} closeModal={closeModal} />
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit, onError)}>
          <div className={classnames('flex flex-col', { hidden: showSummary })}>
            <button type='button' onClick={() => console.log(formMethods.getValues())}>
              TEST: Log Form Values
            </button>
            <button type='button' onClick={() => console.log(formMethods.formState)}>
              TEST: Log State
            </button>
            <button
              type='button'
              onClick={async () => {
                const r = await formMethods.trigger()
                console.log(r)
              }}
            >
              Trigger Validation
            </button>
            <ActionsCard disabled={!userCanCreateProposal} />
            <TitleCard disabled={!userCanCreateProposal} />
            <DescriptionCard disabled={!userCanCreateProposal} />
            <Button
              className='mb-16 w-full'
              disabled={!userCanCreateProposal}
              type='button'
              onClick={(e) => {
                e.preventDefault()
                setShowSummary(true)
                window.scrollTo(0, 0)
              }}
            >
              Preview Proposal
            </Button>
          </div>

          {showSummary && (
            <ProposalSummary
              showForm={() => {
                setShowSummary(false)
                window.scrollTo(0, 0)
              }}
              getValues={formMethods.getValues}
              handleSubmit={formMethods.handleSubmit}
            />
          )}
        </form>
      </FormProvider>
    </>
  )
}

const TitleCard = (props) => {
  const { disabled } = props

  const { t } = useTranslation()
  const { register } = useFormContext()

  return (
    <Card disabled={disabled}>
      <h4 className='mb-2'>{t('title')}</h4>
      <p className='mb-6'>{t('theTitleIsDescription')}</p>
      <TextInputGroup
        className='border-accent-3'
        bgClasses='bg-body'
        alignLeft
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
    <Card disabled={disabled}>
      <h4 className='mb-2'>{t('description')}</h4>
      <p className='mb-8'>{t('theDescriptionShouldPresentInFullDescription')}</p>
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
      view: <MarkdownPreview className='h-96' text={text} />
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
  const { text, className } = props

  return (
    <ReactMarkdown
      plugins={[gfm]}
      className={classnames(
        'description whitespace-pre-wrap break-word overflow-y-auto',
        className
      )}
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
      <div className='bg-body p-4 xs:p-8 border border-accent-3 rounded-b-lg'>
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

const ProposalSummary = (props) => {
  const { t } = useTranslation()
  const { showForm, getValues } = props

  const { actions, title, description } = getValues()

  return (
    <>
      <h4 className='mb-8'>Proposal review</h4>
      <Card>
        <h5 className='mb-4'>Title:</h5>
        <span className='text-accent-1'>{title}</span>
        <h5 className='my-4'>Description:</h5>
        <MarkdownPreview className='text-accent-1' text={description} />
        <h5 className='my-4'>Actions:</h5>
        {actions.map((action, index) => (
          <ActionSummary key={action.id} action={action} index={index} />
        ))}
      </Card>
      <Button
        className='w-full'
        secondary
        type='button'
        onClick={(e) => {
          e.preventDefault()
          showForm()
        }}
      >
        Edit Proposal
      </Button>
      <Button className='mt-4 mb-16 w-full' type='submit'>
        Submit Proposal
      </Button>
    </>
  )
}

const ActionSummary = (props) => {
  const { action, index } = props
  const { contract, fn, id } = action
  const { name: contractName, address } = contract
  const { inputs, name: fnName } = fn

  const actionNumber = index + 1

  return (
    <div className='flex flex-col text-accent-1 mb-4 last:mb-0'>
      <span className='mb-2'>
        <b>{actionNumber}.</b>
        <span className='ml-2'>
          <b>{contractName}</b>
        </span>
        <EtherscanAddressLink className='ml-2 text-inverse hover:text-accent-1' address={address}>
          (<span className='hidden sm:inline'>{address}</span>
          <span className='inline sm:hidden'>{shorten(address)}</span>)
        </EtherscanAddressLink>
      </span>
      <span className='ml-4 xs:ml-8 mb-2'>
        <b>{fnName}</b>(
        {inputs.map(
          (input, index) => `${input.name}${inputs.length && index < inputs.length - 1 ? ', ' : ''}`
        )}
        )
      </span>
      {inputs.map((input, index) => (
        <div
          key={`${id}-${index}-fn-input`}
          className='flex ml-8 xs:ml-12 flex flex-col xs:flex-row mb-2'
        >
          <div className='xs:w-1/4 flex flex-wrap'>
            <b>{input.name}</b>
            <span className='mx-2'>[{input.type}]:</span>
          </div>
          <div className='xs:w-3/4'>
            <span className='text-inverse'>
              <FormattedInputValue {...input} />
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

const FormattedInputValue = (props) => {
  const { type, value } = props

  if (type === 'address') {
    return (
      <EtherscanAddressLink className='text-inverse hover:text-accent-1' address={value}>
        <span className='hidden sm:inline'>{value}</span>
        <span className='inline sm:hidden'>{shorten(value)}</span>
      </EtherscanAddressLink>
    )
  }

  return value
}

const ProposalTransactionModal = (props) => {
  const { isOpen, closeModal, tx } = props

  return (
    <Dialog aria-label='Proposal Summary' isOpen={isOpen} onDismiss={closeModal}>
      <Banner className='flex flex-col relative text-center'>
        <TxStatus tx={tx} />
        {tx && !tx?.inWallet && (
          <button
            className='absolute right-4 top-4 close-button trans text-inverse hover:opacity-30'
            onClick={closeModal}
          >
            <FeatherIcon icon='x' className='w-6 h-6' />
          </button>
        )}
        {/* TODO: Link back to proposal? */}
        {/* TODO: refetch proposals on success */}
      </Banner>
    </Dialog>
  )
}

const getProposeParamsFromForm = (formData) => {
  const targets = []
  const values = []
  const signatures = []
  const calldatas = []
  const description = `# ${formData.title}\n${formData.description}`

  formData.actions.forEach((action) => {
    targets.push(action.contract.address)
    values.push(0)

    const contractInterface = new ethers.utils.Interface(action.contract.abi)
    signatures.push(contractInterface.functions[action.fn.name].signature)
    calldatas.push(
      contractInterface.functions[action.fn.name].encode(
        action.fn.inputs.map((input) => input.value)
      )
    )
  })

  return [targets, values, signatures, calldatas, description]
}

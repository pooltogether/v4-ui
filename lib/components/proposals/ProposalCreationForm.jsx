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
import { poolToast } from 'lib/utils/poolToast'
import { useAllProposals } from 'lib/hooks/useAllProposals'

export const EMPTY_INPUT = {
  type: null,
  name: null,
  value: null
}

export const EMPTY_FN = { inputs: [], name: null, type: null }

export const EMPTY_CONTRACT = {
  address: null,
  name: null,
  abi: null,
  custom: null,
  fn: EMPTY_FN
}

export const EMPTY_ACTION = {
  contract: EMPTY_CONTRACT
}

export const ProposalCreationForm = () => {
  const { t } = useTranslation()
  const { refetch: refetchAllProposals } = useAllProposals()

  const { userCanCreateProposal } = useUserCanCreateProposal()
  const formMethods = useForm({
    mode: 'onSubmit',
    defaultValues: {
      title: '',
      description: '',
      actions: [EMPTY_ACTION]
    }
  })

  const [showSummary, setShowSummary] = useState(false)
  const [validFormData, setValidFormData] = useState()
  const [showModal, setShowModal] = useState(false)

  const { chainId } = useContext(AuthControllerContext)
  const governanceAddress = CONTRACT_ADDRESSES[chainId].GovernorAlpha

  const [txId, setTxId] = useState(0)
  const sendTx = useSendTransaction()
  const tx = useTransaction(txId)

  const onCancelled = () => setShowModal(false)

  const onSuccess = () => {
    refetchAllProposals()
    // TODO: Send user to proposals list or ideally the specific proposal they just created
  }

  const submitTransaction = async () => {
    const params = getProposeParamsFromForm(validFormData)
    const txId = await sendTx('Propose', GovernorAlphaABI, governanceAddress, 'propose', params, {
      onCancelled,
      onSuccess
    })
    console.log(txId)
    setTxId(txId)
    setShowModal(true)
  }

  const onSubmit = async (data) => {
    console.log('Submit', data)
    window?.scrollTo(0, 0)
    setShowSummary(true)
    setValidFormData(data)
  }
  const onError = (data) => {
    console.log('Error', data)
    const parsedErrorMessages = []

    if (data?.title?.message) parsedErrorMessages.push(data.title.message)
    if (data?.description?.message) parsedErrorMessages.push(data.description.message)

    if (data?.actions) {
      data?.actions.forEach((action) => {
        if (action?.contract?.message) {
          parsedErrorMessages.push(action.contract.message)
        }

        if (action?.contract?.fn?.message) {
          parsedErrorMessages.push(action.contract.fn.message)
        }

        if (action?.contract?.fn?.values) {
          Object.keys(action.contract.fn.values).forEach((fnName) => {
            if (action.contract.fn.values[fnName]?.message) {
              console.log('HERE', fnName)
              parsedErrorMessages.push(action.contract.fn.values[fnName].message)
            }
          })
        }
      })
    }

    poolToast.error(parsedErrorMessages.join('. '))
  }

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
            {/* <button type='button' onClick={() => console.log(formMethods.getValues())}>
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
            </button> */}
            <ActionsCard disabled={!userCanCreateProposal} />
            <TitleCard disabled={!userCanCreateProposal} />
            <DescriptionCard disabled={!userCanCreateProposal} />
            <Button className='mb-16 w-full' disabled={!userCanCreateProposal} type='submit'>
              {t('previewProposal')}
            </Button>
          </div>

          {showSummary && (
            <ProposalSummary
              submitTransaction={submitTransaction}
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
        required={t('blankIsRequired', { blank: t('title') })}
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
          required={t('blankIsRequired', { blank: t('description') })}
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
      className={classnames('h-96 p-4 xs:p-8 bg-body text-inverse w-full resize-none', classNames)}
      ref={register({ required, pattern, validate })}
      {...textAreaProps}
    />
  )
}

const MarkdownPreview = (props) => {
  const { text, className } = props

  // Extra div with padding aligns the 'Write' tab content with the 'Preview' tab content exactly
  return (
    <div style={{ paddingTop: 0, paddingBottom: 6 }}>
      <ReactMarkdown
        plugins={[gfm]}
        className={classnames(
          'p-4 xs:p-8 description whitespace-pre-wrap break-word overflow-y-auto tracking-wider',
          className
        )}
        children={text}
      />
    </div>
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
      <div className='bg-body border border-accent-3 rounded-b-lg'>
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

// TODO: It'd be awesome to be able to link to a filled out form. Just stuff everything into query params?
const ProposalSummary = (props) => {
  const { t } = useTranslation()
  const { showForm, getValues, submitTransaction } = props

  const { actions, title, description } = getValues()

  return (
    <>
      <h4 className='mb-8'>Proposal review</h4>
      <Card>
        <h5 className=''>Title:</h5>
        <h6 className='text-accent-1 p-4 xs:p-8'>{title}</h6>
        <h5 className=''>Description:</h5>
        <MarkdownPreview className='text-accent-1' text={description} />
        <h5 className='my-4'>Actions:</h5>
        {actions.map((action, index) => (
          <ActionSummary key={index} action={action} index={index} />
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
      <Button
        className='mt-4 mb-16 w-full'
        type='button'
        onClick={(e) => {
          e.preventDefault()
          submitTransaction()
        }}
      >
        Submit Proposal
      </Button>
    </>
  )
}

const ActionSummary = (props) => {
  const { action, index } = props
  const { contract } = action
  const { name: contractName, address, fn } = contract
  const { inputs, name: fnName, values } = fn

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
          key={`${actionNumber}-${index}-fn-input`}
          className='flex ml-8 xs:ml-12 flex flex-col xs:flex-row mb-2'
        >
          <div className='xs:w-1/4 flex flex-wrap'>
            <b>{input.name}</b>
            <span className='mx-2'>[{input.type}]:</span>
          </div>
          <div className='xs:w-3/4'>
            <span className='text-inverse'>
              <FormattedInputValue {...input} value={values[input.name]} />
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

// TODO: Some functions have optional parameters. That isn't abailable in the ABI.
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
    signatures.push(contractInterface.functions[action.contract.fn.name].signature)
    calldatas.push(
      contractInterface.functions[action.contract.fn.name].encode(
        action.contract.fn.inputs.map((input) => action.contract.fn.values[input.name])
      )
    )
  })

  return [targets, values, signatures, calldatas, description]
}

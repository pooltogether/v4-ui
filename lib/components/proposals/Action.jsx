import FeatherIcon from 'feather-icons-react'
import VisuallyHidden from '@reach/visually-hidden'
import { usePrizePools } from 'lib/hooks/usePrizePools'
import React, { useState } from 'react'
import { useMemo } from 'react'

import PrizePoolAbi from '@pooltogether/pooltogether-contracts/abis/PrizePool'
import { DropdownList } from 'lib/components/DropdownList'
import { TextInputGroup } from 'lib/components/TextInputGroup'
import { useFormContext } from 'react-hook-form'

export const Action = (props) => {
  const { action, setAction, deleteAction, index } = props

  const setContract = (contract) => {
    setAction({
      ...action,
      fn: undefined,
      contract
    })
  }

  const setFunction = (fn) => {
    setAction({
      ...action,
      fn
    })
  }

  return (
    <div className='mt-4 mx-auto py-4 px-8 sm:py-8 sm:px-10 rounded-xl bg-light-purple-10'>
      <div className='flex flex-row justify-between'>
        <h6 className='mb-4'>Action {index + 1}</h6>
        {index > 0 && (
          <button
            className='trans hover:opacity-50'
            onClick={(e) => {
              e.preventDefault()
              deleteAction()
            }}
          >
            <FeatherIcon icon='x' className='stroke-2 w-4 h-4 trans stroke-current text-inverse' />
          </button>
        )}
      </div>

      <div className='flex flex-col'>
        <ContractSelect setContract={setContract} currentContract={action.contract} />
        <div className='flex flex-col xs:pl-8 mt-2'>
          <FunctionSelect
            contract={action.contract}
            setFunction={setFunction}
            fn={action.fn}
            actionIndex={index}
          />
        </div>
      </div>
    </div>
  )
}

const ContractSelect = (props) => {
  const { setContract, currentContract } = props
  const { data: prizePools, isFetched: prizePoolsIsFetched } = usePrizePools()

  const options = useMemo(() => {
    const options = []

    if (prizePoolsIsFetched) {
      prizePools.forEach((prizePool) => {
        options.push({
          address: prizePool.id,
          name: `${prizePool.underlyingCollateralName} Prize Pool`,
          abi: PrizePoolAbi
        })
      })
    }

    options.push({
      address: '',
      name: `Custom Contract`,
      abi: null,
      custom: true
    })

    return options
  }, [prizePools, prizePoolsIsFetched])

  const formatValue = (value) => {
    return value?.name
  }

  const onValueSet = (contract) => {
    setContract(contract)
  }

  return (
    <>
      <DropdownList
        id='contract-picker-dropdown'
        className='text-inverse hover:opacity-50 w-fit-content'
        placeholder='Select a contract'
        formatValue={formatValue}
        onValueSet={onValueSet}
        values={options}
        current={currentContract}
      />
      <CustomContractInput contract={currentContract} setContract={setContract} />
    </>
  )
}

const CustomContractInput = (props) => {
  const { contract } = props
  const [address, setAddress] = useState('')

  if (!contract?.custom) return null

  // TODO: Debounce fetch abi from etherscan

  return (
    <TextInputGroup
      id='_customContractAddress'
      label='Custom contract address'
      value={address}
      placeholder='0x1f9840a85...'
      onChange={(e) => {
        e.preventDefault()
        setAddress(e.target.value)
      }}
    />
  )
}

const FunctionSelect = (props) => {
  const { fn, contract, setFunction, actionIndex } = props
  const functions = useMemo(
    () =>
      contract?.abi?.filter((item) => item.type === 'function' && item.stateMutability !== 'view'),
    [contract]
  )

  if (!contract) return null

  const formatValue = (fn) => {
    return fn?.name
  }

  const onValueSet = (fn) => {
    setFunction(fn)
  }

  // TODO: Custom Contract input for custom data blob

  return (
    <>
      <DropdownList
        id='function-picker-dropdown'
        className='text-inverse hover:opacity-50 w-fit-content'
        placeholder='Select a function'
        formatValue={formatValue}
        onValueSet={onValueSet}
        values={functions}
        current={fn}
      />
      <FunctionInputs fn={fn} actionIndex={actionIndex} />
    </>
  )
}

const FunctionInputs = (props) => {
  const { fn, actionIndex } = props
  const inputs = fn?.inputs
  if (!fn || inputs.length === 0) return null

  // TODO: Pass the register all the way down, dynamically set the name

  return (
    <ul className='mt-2'>
      {inputs.map((input, index) => (
        <FunctionInput
          fnName={fn.name}
          key={input.name}
          {...input}
          actionIndex={actionIndex}
          inputIndex={index}
        />
      ))}
    </ul>
  )
}

const FunctionInput = (props) => {
  const { name, type, fnName, actionIndex, inputIndex } = props
  const { register } = useFormContext()

  // TODO: Validate inputs? At least addresses.
  return (
    <li className='mt-2 first:mt-0 flex'>
      <span className='w-1/4 text-right'>
        {name} <span className='ml-1 text-xxs opacity-70'>{`[${type}]`}</span>
      </span>
      <input
        className='bg-card w-3/4 ml-4'
        name={`actions[${actionIndex}].fn.inputs[${inputIndex}].value`}
        ref={register({ required: true })}
        type='text'
        autoComplete={`${fnName}.${name}`}
        autoCorrect='off'
      />
    </li>
  )
}

// TODO: Unused but kinda nice
const Select = (props) => {
  const { options, label, ...selectProps } = props

  return (
    <>
      {label && <label htmlFor={selectProps.name}>{label}</label>}
      <VisuallyHidden>{label}</VisuallyHidden>
      <select {...selectProps}>
        {options.map((option, index) => {
          const { view, ...optionProps } = option
          return (
            <option key={index} {...optionProps}>
              {view || option.value}
            </option>
          )
        })}
      </select>
    </>
  )
}

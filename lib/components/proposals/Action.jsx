import FeatherIcon from 'feather-icons-react'
import classnames from 'classnames'
import React, { useContext, useState, useMemo, useEffect } from 'react'
import { useController, useForm, useFormContext, useWatch } from 'react-hook-form'
import { ClipLoader } from 'react-spinners'

import { useTranslation } from 'lib/../i18n'
import { isValidAddress } from 'lib/utils/isValidAddress'
import { usePrizePools } from 'lib/hooks/usePrizePools'
import { DropdownList } from 'lib/components/DropdownList'
import { CONTRACT_ADDRESSES } from 'lib/constants'
import { AuthControllerContext } from 'lib/components/contextProviders/AuthControllerContextProvider'
import { useEtherscanAbi } from 'lib/hooks/useEtherscanAbi'

import DelegateableERC20ABI from 'abis/DelegateableERC20ABI'
import PrizePoolAbi from '@pooltogether/pooltogether-contracts/abis/PrizePool'
import TokenFaucetAbi from '@pooltogether/pooltogether-contracts/abis/TokenFaucet'
import MultipleWinnersPrizeStrategyAbi from '@pooltogether/pooltogether-contracts/abis/MultipleWinners'

export const Action = (props) => {
  const { action, setAction, deleteAction, index, hideRemoveButton } = props
  const { t } = useTranslation()

  // const { control } = useFormContext()
  // const actionName = `actions[${index}]`
  // useController({
  //   name: actionName,
  //   control,
  //   rules: { required: true, validate: validateAction },
  //   defaultValue: [
  //     {
  //       id: Date.now()
  //     }
  //   ]
  // })

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
    <div className='mt-4 mx-auto p-4 sm:py-8 sm:px-10 rounded-xl bg-light-purple-10'>
      <div className='flex flex-row justify-between'>
        <h6 className='mb-4'>{t('actionNumber', { number: index + 1 })}</h6>
        {!hideRemoveButton && (
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

  const { t } = useTranslation()
  const { data: prizePools, isFetched: prizePoolsIsFetched } = usePrizePools()
  const { chainId } = useContext(AuthControllerContext)

  const options = useMemo(() => {
    const options = []

    if (prizePoolsIsFetched) {
      // Add POOL token
      options.push({
        address: CONTRACT_ADDRESSES[chainId].GovernanceToken,
        name: t('poolToken'),
        abi: DelegateableERC20ABI
      })

      options.push({
        address: '',
        name: t('customContract'),
        abi: null,
        custom: true
      })

      // Add Prize Pool contracts
      options.push({
        groupHeader: t('prizePools')
      })
      Object.keys(prizePools).forEach((prizePoolAddress) => {
        const prizePool = prizePools[prizePoolAddress]
        options.push({
          address: prizePool.prizePool,
          name: t('prizePoolTokenName', {
            tokenSymbol: prizePool.underlyingCollateralSymbol,
            tokenName: prizePool.underlyingCollateralName
          }),
          abi: PrizePoolAbi
        })
      })

      // Add Prize Strategies
      options.push({
        groupHeader: t('prizeStrategies')
      })
      Object.keys(prizePools).forEach((prizePoolAddress) => {
        const prizePool = prizePools[prizePoolAddress]
        options.push({
          address: prizePool.prizeStrategy,
          name: t('prizeStrategyTokenName', {
            tokenSymbol: prizePool.underlyingCollateralSymbol,
            tokenName: prizePool.underlyingCollateralName
          }),
          abi: MultipleWinnersPrizeStrategyAbi
        })
      })

      // Add Token Faucets
      options.push({
        groupHeader: t('tokenFaucets')
      })
      Object.keys(prizePools).forEach((prizePoolAddress) => {
        const prizePool = prizePools[prizePoolAddress]
        options.push({
          address: prizePool.tokenFaucet,
          name: t('tokenFaucetTokenName', {
            tokenSymbol: prizePool.underlyingCollateralSymbol,
            tokenName: prizePool.underlyingCollateralName
          }),
          abi: TokenFaucetAbi
        })
      })
    }

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
        placeholder={t('selectAContract')}
        formatValue={formatValue}
        onValueSet={onValueSet}
        values={options}
        current={currentContract}
      />
      {currentContract?.custom && (
        <CustomContractInput contract={currentContract} setContract={setContract} />
      )}
    </>
  )
}

const CustomContractInput = (props) => {
  const { contract, setContract } = props

  const { t } = useTranslation()
  const [showAbiInput, setShowAbiInput] = useState(false)
  const addressFormName = 'contractAddress'
  const { register, control, errors } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  })
  const address = useWatch({ control, name: addressFormName })

  const {
    data: etherscanAbiUseQueryResponse,
    isFetching: etherscanAbiIsFetching
  } = useEtherscanAbi(address, showAbiInput)

  useEffect(() => {
    if (showAbiInput) return

    // If there was no response, clear the abi in the form
    if (!etherscanAbiUseQueryResponse) {
      if (contract.abi) {
        setContract({
          ...contract,
          abi: null
        })
      }
      return
    }

    handleEtherscanAbiUseQueryResponse(etherscanAbiUseQueryResponse, setContract, contract)
  }, [etherscanAbiUseQueryResponse, showAbiInput])

  const etherscanAbiStatus = etherscanAbiUseQueryResponse?.data?.status
  const errorMessage = getErrorMessage(errors?.[addressFormName]?.message, etherscanAbiStatus)

  // TODO: This will only work with mainnet contracts

  return (
    <>
      <SimpleInput
        className='mt-2'
        label={t('contractAddress')}
        errorMessage={errorMessage}
        name={addressFormName}
        register={register}
        required
        validate={(address) => isValidAddress(address) || t('invalidContractAddress')}
        placeholder='0x1f9840a85...'
        loading={etherscanAbiIsFetching}
      />
      {showAbiInput && <CustomAbiInput contract={contract} setContract={setContract} />}

      <div className='flex flex-col xs:flex-row xs:w-3/4 xs:ml-auto'>
        <button
          type='button'
          onClick={(e) => {
            e.preventDefault()
            setShowAbiInput(!showAbiInput)
          }}
          className='xs:ml-auto mt-2 w-fit-content text-xxs text-inverse hover:opacity-50 trans'
        >
          {showAbiInput ? t('hideAbiInput') : t('haveTheAbiManuallyInput')}
        </button>
      </div>
    </>
  )
}

const CustomAbiInput = (props) => {
  const { contract, setContract } = props

  const { t } = useTranslation()
  const abiFormName = 'contractAbi'
  const { register, watch } = useForm()
  const abiString = watch(abiFormName, false)

  useEffect(() => {
    if (abiString) {
      try {
        const abi = JSON.parse(abiString)
        setContract({
          ...contract,
          abi
        })
      } catch (e) {
        console.warn(e.message)
        setContract({
          ...contract,
          abi: null
        })
      }
    } else if (contract.abi) {
      setContract({
        ...contract,
        abi: null
      })
    }
  }, [abiString])

  return (
    <SimpleInput
      className='mt-4'
      label={t('contractAbi')}
      name={abiFormName}
      register={register}
      required
      placeholder='[{ type: "function", ...'
    />
  )
}

const FunctionSelect = (props) => {
  const { fn, contract, setFunction, actionIndex } = props
  const { t } = useTranslation()

  const functions = useMemo(
    () =>
      contract?.abi?.filter((item) => item.type === 'function' && item.stateMutability !== 'view'),
    [contract]
  )

  if (!contract || !contract?.abi) return null

  const formatValue = (fn) => {
    return fn?.name
  }

  const onValueSet = (fn) => {
    setFunction(fn)
  }

  return (
    <>
      <DropdownList
        id='function-picker-dropdown'
        className='text-inverse hover:opacity-50 w-fit-content'
        placeholder={t('selectAFunction')}
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
      <SimpleInput
        label={name}
        name={`actions[${actionIndex}].fn.inputs[${inputIndex}].value`}
        register={register}
        required
        dataType={type}
      />
    </li>
  )
}

const SimpleInput = (props) => {
  const {
    className,
    name,
    dataType,
    register,
    required,
    pattern,
    validate,
    autoCorrect,
    label,
    loading,
    errorMessage,
    autoComplete,
    ...inputProps
  } = props

  return (
    <>
      <span className={classnames('flex flex-col xs:flex-row w-full relative', className)}>
        <label className='xs:w-1/4 xs:text-right my-auto xs:mr-4' htmlFor={name}>
          {label} {dataType && <span className='ml-1 text-xxs opacity-70'>{`[${dataType}]`}</span>}
        </label>
        <input
          {...inputProps}
          className='bg-card xs:w-3/4 p-2 rounded-sm outline-none focus:outline-none active:outline-none hover:bg-primary focus:bg-primary trans trans-fast border border-transparent focus:border-card'
          id={name}
          name={name}
          ref={register({ required, pattern, validate })}
          type='text'
          autoCorrect={autoCorrect || 'off'}
          autoComplete={autoComplete || 'hidden'}
        />
        {loading && (
          <div className='absolute right-0 mr-2 mt-2'>
            <ClipLoader size={14} color='rgba(255,255,255,0.3)' />
          </div>
        )}
      </span>
      {errorMessage && <span className='ml-auto text-xxs text-red font-bold'>{errorMessage}</span>}
    </>
  )
}

const getErrorMessage = (validationMessage, status) => {
  const { t } = useTranslation()

  if (validationMessage) return validationMessage
  if (status === '0') return t('contractAbiNotFoundOnEtherscan')

  return null
}

const handleEtherscanAbiUseQueryResponse = (
  etherscanAbiUseQueryResponse,
  setContract,
  contract
) => {
  const { status: requestStatus, data: etherscanAbiRequestResponse } = etherscanAbiUseQueryResponse

  // Check http request status
  if (requestStatus === 200) {
    const { status: etherscanAbiStatus, result: etherscanAbi } = etherscanAbiRequestResponse

    // Check the status of the contract abi
    if (etherscanAbiStatus != '1') {
      setContract({
        ...contract,
        abi: null
      })
      return
    }

    // Try to parse the response
    try {
      const abi = JSON.parse(etherscanAbi)
      setContract({
        ...contract,
        abi
      })
    } catch (e) {
      setContract({
        ...contract,
        abi: null
      })
    }
  } else if (contract.abi) {
    setContract({
      ...contract,
      abi: null
    })
  }
}

const validateAction = (action) => {
  // TODO: Validate action
  return false || 'Missing Data'
}

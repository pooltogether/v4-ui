const validator = require('solidity-validator')

export const dataArrayRegex = /^\[.*\]$/
export const tupleRegex = /^\(.*\)$/
export const arrayRegex = /\[\]$/
export const fixedArrayRegex = /\[[\d]+\]$/

/**
 *
 * @param {*} dataType string - solidity data type
 * @param {*} data string - text input of the data type
 * @param {*} components optional - from abi - defines the structure of a tuple
 */
export const isValidSolidityData = (dataType, data, components = []) => {
  // Empty values will be replaced with defaults later
  if (!data) return true

  try {
    // Tuples
    if (dataType === 'tuple') {
      const parsedData = JSON.parse(data)
      const keys = Object.keys(parsedData)

      if (keys.length !== components.length) return false

      return components.reduce((currentlyValid, component) => {
        const componentValue = parsedData[component.name]
        // No input value will be replaced with a default value later
        if (componentValue === undefined) return true && currentlyValid
        return (
          isValidSolidityData(component.type, formatValue(componentValue), component.components) &&
          currentlyValid
        )
      }, true)
    }

    // Array
    if (arrayRegex.test(dataType)) {
      if (!dataArrayRegex.test(data)) return false

      const dataValues = JSON.parse(data)
      const individualValueDataType = dataType.slice(0, dataType.length - 2)

      return dataValues.reduce(
        (currentlyValid, value) =>
          validator.isValid(individualValueDataType, formatValue(value)) && currentlyValid,
        true
      )
    }

    // Fixed array
    if (fixedArrayRegex.test(dataType)) {
      if (!dataArrayRegex.test(data)) {
        return false
      }

      const dataValues = JSON.parse(data)
      const fixedLength = dataType.match(fixedArrayRegex)[0]
      const length = Number(fixedLength.slice(1, fixedLength.length - 1))

      if (length !== dataValues.length) return false

      const individualValueDataType = dataType.slice(0, dataType.length - fixedLength.length)
      return dataValues.reduce(
        (currentlyValid, value) =>
          validator.isValid(individualValueDataType, formatValue(value)) && currentlyValid,
        true
      )
    }

    return validator.isValid(dataType, data)
  } catch (e) {
    console.error(e.message)
    return false
  }
}

const formatValue = (value) => (typeof value === 'string' ? value : JSON.stringify(value))

// Solidity ABI data types
// https://docs.soliditylang.org/en/v0.5.3/abi-spec.html#argument-encoding

// int<M>
// uint<M>
// address
// uint, int
// bool
// fixed<M>x<N>
// ufixed<M>x<N>
// fixed, ufixed
// bytes<M>
// function
// <type>[M]
// bytes
// string
// <type>[]
// (T1,T2,...,Tn)  // Tuple

const validator = require('solidity-validator')

export const isValidSolidityData = (dataType, value) => {
  if (!value) return true

  try {
    // TODO: Tuples first

    // Array
    if (/\[\]$/.test(dataType)) {
      const values = value.slice(1, value.length - 1).split(',')
      const individualValueDataType = dataType.slice(0, dataType.length - 2)
      console.log(
        individualValueDataType,
        values,
        values.reduce(
          (currentlyValid, value) => {
            console.log(value, currentlyValid, validator.isValid(individualValueDataType, value))
            return validator.isValid(individualValueDataType, value) && currentlyValid
          },

          true
        )
      )
      return values.reduce(
        (currentlyValid, value) =>
          validator.isValid(individualValueDataType, value) && currentlyValid,
        true
      )
    }

    // Fixed array
    if (/\[[\d]*\]$/.test(dataType)) {
      const parsedValue = JSON.parse(value)
      // TODO: Need to validate the individual inputs
      return true
    }

    return validator.isValid(dataType, value)
  } catch (e) {
    console.log(e)
    return false
  }
}

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

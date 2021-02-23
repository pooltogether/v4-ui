const validator = require('solidity-validator')

export const isValidSolidityData = (dataType, value) => {
  if (!value) return true

  try {
    // TODO: Tuples first

    // Array
    if (/\[\]$/.test(dataType)) {
      const values = value.slice(1, value.length - 1).split(',')
      const individualValueDataType = dataType.slice(0, dataType.length - 2)
      return values.reduce(
        (currentlyValid, value) =>
          validator.isValid(individualValueDataType, value) && currentlyValid,
        true
      )
    }

    // Fixed array
    const fixedArrayRegex = /\[[\d]+\]$/
    if (fixedArrayRegex.test(dataType)) {
      const values = value.slice(1, value.length - 1).split(',')
      const fixedLength = dataType.match(fixedArrayRegex)[0]
      const length = Number(fixedLength[0].slice(1, fixedLength[0].length - 1))

      if (length !== values.length) return false

      const individualValueDataType = dataType.slice(0, dataType.length - 2)
      return values.reduce(
        (currentlyValid, value) =>
          validator.isValid(individualValueDataType, value) && currentlyValid,
        true
      )
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

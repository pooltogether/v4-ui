import { ethers } from 'ethers'

export const getEmptySolidityDataTypeValue = (dataType) => {
  if (/\[[\d]*\]$/.test(dataType)) return []
  if (/\[\]$/.test(dataType)) return []
  if (dataType === 'string') return ''
  if (dataType === 'address') return ethers.constants.AddressZero
  if (dataType === 'bool') return false
  if (/\int/.test(dataType)) return 0
  if (/fixed/.test(dataType)) return 0
  // TODO: Tuples
  return ''
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

export const transformHexColor = (color) => {
  // if rinkeby, return ethereum mainnet color
  if (color === '#e09e0a') {
    return '#4b78ff'
  }

  return color
}

export const darkenHexColor = (color) => {
  // if rinkeby, return ethereum mainnet color
  if (color === '#e09e0a') {
    return '#2b58bf'
  }

  return color
}

export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

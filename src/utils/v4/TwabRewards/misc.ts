export const transformHexColor = (color) => {
  // if rinkeby, return ethereum mainnet color
  if (color === '#e09e0a') {
    return '#4b78ff'
  }

  // if optimism, return a red close to the logo
  if (color === '#e61b1b') {
    return '#E8000B'
  }

  return color
}

export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

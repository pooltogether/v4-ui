import { ThemeContext } from '@pooltogether/react-components'
import { useContext } from 'react'

export const useTheme = () => {
  return useContext(ThemeContext)
}

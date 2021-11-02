import { ThemeContext } from '@pooltogether/react-components'
import { useContext } from 'react'

export enum ColorTheme {
  light = 'light',
  dark = 'dark'
}

export const useTheme = (): { theme: ColorTheme; toggleTheme: () => void } => {
  return useContext(ThemeContext)
}

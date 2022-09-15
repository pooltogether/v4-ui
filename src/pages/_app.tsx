import { AppContainer } from '@components/AppContainer'
import type { AppProps } from 'next/app'
import React from 'react'

// CSS
import '@styles/index.css'
import '@pooltogether/react-components/dist/globals.css'
import '@styles/gradients.css'
import '@styles/tsunami.css'
import 'react-toastify/dist/ReactToastify.css'
import 'react-spring-bottom-sheet/dist/style.css'
import '@styles/bottomSheet.css'

const App: React.FC<AppProps> = (props) => {
  return <AppContainer {...props} />
}

export default App

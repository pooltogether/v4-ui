import { Card } from '@pooltogether/react-components'
import React from 'react'

export const ReservesCard = (props) => {
  return (
    <Card>
      <h6>Tokens</h6>
      <h4>$3,700,002.01</h4>
      <TokenList />
    </Card>
  )
}

const TokenList = () => {
  return <ul></ul>
}

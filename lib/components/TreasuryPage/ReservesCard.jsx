import { Card } from '@pooltogether/react-components'
import React from 'react'

export const ReservesCard = (props) => {
  return (
    <Card>
      <h6>Prize Pool Reserves</h6>
      <h4>$300,002.01</h4>
      <ReservesList />
    </Card>
  )
}

const ReservesList = () => {
  return <ul></ul>
}

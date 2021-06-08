import { Card } from '@pooltogether/react-components'
import React from 'react'

export const PoolPriceCard = (props) => {
  return (
    <Card>
      <h6>POOL Price</h6>
      <div className='flex flex-col sm:flex-row sm:justify-between'>
        <h4>$18.01</h4>
        <a rel='noopener noreferrer' href='https://www.coingecko.com/en/coins/pooltogether'>
          Historical price
        </a>
      </div>
    </Card>
  )
}

import React from 'react'

export function ErrorsBox(props) {
  const { errors } = props

  const errorMessages = Object.values(errors).map((error) => error.message)

  return (
    <div
      className='font-semibold font-inter text-red text-center mb-2'
      style={{
        minHeight: 24
      }}
    >
      {errorMessages.map((errorMsg) => errorMsg)}
    </div>
  )
}

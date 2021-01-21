import React from 'react'
import FeatherIcon from 'feather-icons-react'

import TheGraphLogo from 'assets/images/thegraphlogo.png'

export function GraphErrorModal() {
  return (
    <>
      <div
        id='graph-error-modal'
        className='hidden w-screen h-screen fixed t-0 l-0 r-0 b-0'
        style={{
          zIndex: 199,
        }}
      >
        <div
          className={'fixed t-0 l-0 r-0 b-0 w-full h-full bg-overlay bg-blur'}
          style={{
            zIndex: 198,
          }}
        ></div>

        <div
          className='graph-modal fixed xs:inset-4 bg-black text-white border-2 border-green rounded-lg px-6 py-4 font-bold mt-32'
          style={{
            maxHeight: '26rem',
            zIndex: 200,
          }}
        >
          <button
            onClick={(e) => {
              e.preventDefault()
              window.hideGraphError()
            }}
            className='absolute r-0 t-0 text-inverse opacity-70 hover:opacity-100 trans outline-none focus:outline-none active:outline-none mt-2 mr-2'
          >
            <FeatherIcon icon='x' className='w-4 h-4' strokeWidth='0.09rem' />
          </button>

          <div className='flex flex-col items-center justify-center h-full text-center'>
            <img src={TheGraphLogo} alt='The Graph Protocol' className='w-24 h-auto mx-auto mb-4' />
            PoolTogether relies on The Graph Protocol. Unfortunately, we are temporarily unable to
            fetch data from The Graph Protocol.
            <div className='mt-4'>Please try again soon...</div>
            <a
              href='https://status.thegraph.com/'
              className='inline-block border-b border-green hover:border-0 text-xxs mt-10'
              target='_blank'
              rel='noreferrer noopener'
            >
              View Graph status
            </a>
            <br />
            <button
              onClick={(e) => {
                e.preventDefault()
                window.location.reload()
              }}
              className='inline-block text-white border-b border-white hover:border-0 text-xxxs mt-2 opacity-40 hover:opacity-100'
            >
              refresh page
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

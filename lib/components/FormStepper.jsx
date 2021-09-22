import React from 'react'
import FeatherIcon from 'feather-icons-react'
import classnames from 'classnames'

import { DEPOSIT_STATES } from 'lib/views/Deposit/Deposit'

export const FormStepper = (props) => {
  const { activeStep, tokenSymbol } = props

  const defaultCircleClassNames = 'border-2 h-4 w-4 rounded-full trans'
  const completedCircleClassNames = 'bg-highlight-1 border-highlight-1'
  const activeCircleClassNames = 'bg-card border-highlight-1'
  const inactiveCircleClassNames = 'bg-card-selected border-transparent'

  const defaultLabelClassNames = 'font-inter text-xxs font-semibold mt-2 relative trans'
  const activeLabelClassNames = 'text-highlight-1'
  const inactiveLabelClassNames = 'text-primary-soft opacity-60'

  const defaultBarClassNames = 'h-1 w-1/2 relative trans'
  const activeBarClassNames = 'bg-highlight-1'
  const inactiveBarClassNames = 'bg-transparent'

  const Labels = () => {
    return (
      <div className='w-2/3 flex justify-between items-center mt-2 relative mx-auto'>
        <div
          className={classnames(defaultLabelClassNames, {
            [activeLabelClassNames]: activeStep >= DEPOSIT_STATES.approving,
            [inactiveLabelClassNames]: activeStep < DEPOSIT_STATES.approving
          })}
          style={{ left: -34 }}
        >
          Allow {tokenSymbol}
        </div>
        <div
          className={classnames(defaultLabelClassNames, {
            [activeLabelClassNames]: activeStep >= DEPOSIT_STATES.depositing,
            [inactiveLabelClassNames]: activeStep < DEPOSIT_STATES.depositing
          })}
          style={{ right: -10 }}
        >
          Deposit {tokenSymbol}
        </div>
        <div
          className={classnames(defaultLabelClassNames, {
            [activeLabelClassNames]: activeStep >= DEPOSIT_STATES.confirming,
            [inactiveLabelClassNames]: activeStep < DEPOSIT_STATES.confirming
          })}
          style={{ right: -44 }}
        >
          Confirm Order
        </div>
      </div>
    )
  }

  const Bars = () => {
    return (
      <>
        <div
          className={classnames(defaultBarClassNames, {
            [activeBarClassNames]: activeStep > DEPOSIT_STATES.approving,
            [inactiveBarClassNames]: activeStep <= DEPOSIT_STATES.approving
          })}
          style={{ height: 2, left: 2 }}
        ></div>
        <div
          className={classnames(defaultBarClassNames, {
            [activeBarClassNames]: activeStep > DEPOSIT_STATES.depositing,
            [inactiveBarClassNames]: activeStep <= DEPOSIT_STATES.depositing
          })}
          style={{ height: 2, right: 2 }}
        ></div>
      </>
    )
  }

  const Circles = () => {
    return (
      <>
        <div
          className={classnames(defaultCircleClassNames, {
            [completedCircleClassNames]: activeStep > DEPOSIT_STATES.approving,
            [activeCircleClassNames]: activeStep === DEPOSIT_STATES.approving,
            [inactiveCircleClassNames]: activeStep < DEPOSIT_STATES.approving
          })}
        ></div>
        <div
          className={classnames(defaultCircleClassNames, {
            [completedCircleClassNames]: activeStep > DEPOSIT_STATES.depositing,
            [activeCircleClassNames]: activeStep === DEPOSIT_STATES.depositing,
            [inactiveCircleClassNames]: activeStep < DEPOSIT_STATES.depositing
          })}
        ></div>
        <div
          className={classnames(defaultCircleClassNames, {
            [completedCircleClassNames]: activeStep > DEPOSIT_STATES.confirming,
            [activeCircleClassNames]: activeStep === DEPOSIT_STATES.confirming,
            [inactiveCircleClassNames]: activeStep < DEPOSIT_STATES.confirming
          })}
        ></div>
      </>
    )
  }

  const DepositCompleteMessage = (props) => {
    return (
      <div
        className={classnames('absolute flex flex-col w-full trans', activeLabelClassNames)}
        style={{ top: -6 }}
      >
        <FeatherIcon icon='check-circle' className={classnames('w-4 h-4 mx-auto stroke-current')} />
        <div className={classnames('text-center', defaultLabelClassNames)}>Deposit complete!</div>
      </div>
    )
  }

  return (
    <>
      <div className='relative w-full mt-10'>
        <div
          className={classnames('trans', {
            'opacity-0': activeStep !== DEPOSIT_STATES.complete
          })}
          style={{
            height: activeStep === DEPOSIT_STATES.complete ? 40 : 1
          }}
        >
          <div className='absolute w-full t-0 l-0 b-0 r-0 mx-auto'>
            <DepositCompleteMessage />
          </div>
        </div>
        <div
          className={classnames('trans', {
            'opacity-0': activeStep > DEPOSIT_STATES.confirming
          })}
          style={{
            height: activeStep !== DEPOSIT_STATES.complete ? 40 : 1
          }}
        >
          <div className='absolute w-full t-0 l-0 b-0 r-0 mx-auto'>
            <div
              className='bg-card-selected w-2/3 flex justify-between items-center relative mx-auto'
              style={{ height: 2 }}
            >
              <div className='w-full flex justify-between items-center absolute t-0 l-0 r-0 b-0 z-20'>
                <Circles />
              </div>

              <Bars />
            </div>
            <Labels />
          </div>
        </div>
      </div>
    </>
  )
}

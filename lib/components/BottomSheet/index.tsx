import { ScreenSize, useScreenSize } from '.yalc/@pooltogether/hooks/dist'
import { Modal } from '.yalc/@pooltogether/react-components/dist'
import classNames from 'classnames'
import React from 'react'
import {
  BottomSheet as ReactSpringBottomSheet,
  BottomSheetProps as ReactSpringBottomSheetProps
} from 'react-spring-bottom-sheet'
import { SnapPointProps } from 'react-spring-bottom-sheet/dist/types'

export interface BottomSheetProps extends ReactSpringBottomSheetProps {
  className?: string
  label?: string
}

export const BottomSheet = (props: BottomSheetProps) => {
  const { children, open, onDismiss, className, label, ...sheetProps } = props
  const size = useScreenSize()

  if (size > ScreenSize.sm) {
    return (
      <Modal label={label} isOpen={open} closeModal={onDismiss} className={className}>
        {children}
      </Modal>
    )
  }

  return (
    <ReactSpringBottomSheet {...sheetProps} open={open} onDismiss={onDismiss}>
      <div className={classNames('px-4 pt-2 pb-4', className)}>{children}</div>
    </ReactSpringBottomSheet>
  )
}

BottomSheet.defaultProps = {
  label: 'bottom-sheet'
}

export const snapTo90 = (snapPoints: SnapPointProps) => snapPoints.maxHeight * 0.9

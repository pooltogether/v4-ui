import { ScreenSize, useScreenSize } from '@pooltogether/hooks'
import { Modal } from '@pooltogether/react-components'
import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  BottomSheet as ReactSpringBottomSheet,
  BottomSheetProps as ReactSpringBottomSheetProps
} from 'react-spring-bottom-sheet'
import { SnapPointProps } from 'react-spring-bottom-sheet/dist/types'

export interface BottomSheetProps extends ReactSpringBottomSheetProps {
  className?: string
  label?: string
  hideCloseButton?: boolean
  // Modal specific props, pull from ModalProps as needed
  maxWidthClassName?: string
}

export const BottomSheet = (props: BottomSheetProps) => {
  const {
    children,
    open,
    onDismiss,
    className,
    label,
    hideCloseButton,
    maxWidthClassName,
    ...sheetProps
  } = props
  const size = useScreenSize()
  const { t } = useTranslation()

  if (size > ScreenSize.sm) {
    return (
      <Modal
        label={label}
        isOpen={open}
        closeModal={onDismiss}
        className={className}
        maxWidthClassName={maxWidthClassName}
      >
        {children}
      </Modal>
    )
  }

  return (
    <ReactSpringBottomSheet {...sheetProps} open={open} onDismiss={onDismiss}>
      <div className={classNames('px-4 pt-4 flex-grow ', className)}>{children}</div>
      {!hideCloseButton && (
        <button className='flex-none mx-auto text-accent-3 font-bold pb-4 pt-6' onClick={onDismiss}>
          {t('Close')}
        </button>
      )}
    </ReactSpringBottomSheet>
  )
}

BottomSheet.defaultProps = {
  label: 'bottom-sheet'
}

export const snapTo90 = (snapPoints: SnapPointProps) => snapPoints.maxHeight * 0.9

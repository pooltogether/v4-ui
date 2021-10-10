import { Modal } from '@pooltogether/react-components'

interface ModalWithStylesProps {
  isOpen: boolean
  closeModal: () => void
  children: React.ReactNode
  label: string
}

export const ModalWithStyles = (props: ModalWithStylesProps) => (
  <Modal
    {...props}
    label={props.label}
    noSize
    noBgColor
    noPad
    className='h-full sm:h-auto sm:max-w-md shadow-3xl bg-new-modal px-2 xs:px-8 py-10'
  />
)

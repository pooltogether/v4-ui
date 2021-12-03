import { BottomSheet } from 'lib/components/BottomSheet'
import { useState } from 'react'
import { BottomSheetProps } from 'react-spring-bottom-sheet'

export const TotalPrizeClaimed = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>X prizes claimed</button>
      <TotalPrizeClaimedSheet open={isOpen} onDismiss={() => setIsOpen(false)} />
    </>
  )
}

const TotalPrizeClaimedSheet = (props: Omit<BottomSheetProps, 'children'>) => {
  const { open, onDismiss } = props
  return (
    <BottomSheet open={open} onDismiss={onDismiss}>
      hi
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
    </BottomSheet>
  )
}

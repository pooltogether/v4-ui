import { useOnboard } from '@pooltogether/bnc-onboard-hooks'

export const useUsersAddress = () => {
  const { address } = useOnboard()
  return '0x856Bf74e6a12E398699d366d5C9F743854603e0D'
  // return address
}

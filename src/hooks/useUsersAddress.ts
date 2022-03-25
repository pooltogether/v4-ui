import { useOnboard } from '@pooltogether/bnc-onboard-hooks'

export const useUsersAddress = () => {
  const { address } = useOnboard()
  return '0x426116891341F96b87161c797c76AE3a81d10C85'
  return address
}

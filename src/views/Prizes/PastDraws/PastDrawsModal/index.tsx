import { LatestDrawId } from '@components/PrizeDistributor/LatestDrawId'
import { usePrizeDistributorToken } from '@hooks/v4/PrizeDistributor/usePrizeDistributorToken'
import { useLatestDrawWinners } from '@hooks/v4/useDrawWinners'
import { useLatestDrawWinnersInfo } from '@hooks/v4/useDrawWinnersInfo'
import {
  BottomSheet,
  LinkIcon,
  Modal,
  NetworkIcon,
  TokenIcon
} from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId, shorten } from '@pooltogether/utilities'
import { PrizeDistributor } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import Link from 'next/link'

export const PastDrawsModal = (props: {
  isOpen: boolean
  closeModal: () => void
  prizeDistributor: PrizeDistributor
}) => {
  const { isOpen, closeModal, prizeDistributor } = props
  const { data: winners } = useLatestDrawWinners(prizeDistributor, true)
  const { data: winnersInfo } = useLatestDrawWinnersInfo(prizeDistributor)
  const { data: tokenData } = usePrizeDistributorToken(prizeDistributor)

  return (
    <Modal label={'Past draws modal'} isOpen={isOpen} closeModal={closeModal}>
      {/* Title */}
      <div className='text-2xl font-bold flex space-x-2 mb-4'>
        <span>Draw #</span>
        <LatestDrawId prizeDistributor={prizeDistributor} />{' '}
      </div>
      <div className='mb-8'>
        Draw #
        <LatestDrawId prizeDistributor={prizeDistributor} /> on{' '}
        {getNetworkNiceNameByChainId(prizeDistributor.chainId)} had{' '}
        <b>{winnersInfo?.prizesWon} prizes</b> totalling{' '}
        <b className='animate-rainbow'>{winnersInfo?.amount.amountPretty}</b>{' '}
        {tokenData?.token.symbol}
      </div>

      {/* Table */}
      <div className='grid grid-cols-2 text-center text-opacity-80 mb-3'>
        <span>Pooler</span>
        <span>Prize</span>
      </div>
      <ul className='space-y-2'>
        {winners?.prizes.map(({ address, amount, pick, tier }) => (
          <li key={pick} className='grid grid-cols-2 text-center'>
            <Link href={`/account/${address}`}>
              <a className='hover:text-pt-teal'>
                {shorten({ hash: address })}
                <LinkIcon className='w-4 h-4' />
              </a>
            </Link>
            <div className='flex space-x-1 items-center mx-auto'>
              <TokenIcon
                chainId={prizeDistributor.chainId}
                address={tokenData?.token.address}
                sizeClassName='w-4 h-4'
              />
              <b className={classNames({ 'animate-rainbow': tier === 0 })}>{amount.amountPretty}</b>
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  )
}

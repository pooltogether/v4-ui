import { batch, contract } from '@pooltogether/etherplex'
import { CHAIN_ID, getReadProvider } from '@pooltogether/wallet-connection'
import { BigNumber, Contract } from 'ethers'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useEffect } from 'react'
import { useQuery } from 'react-query'

const NFTS = Object.freeze([
  '0x90B3832e2F2aDe2FE382a911805B6933C056D6ed', // Supporter
  '0x3545192b340F50d77403DC0A64cf2b32F03d00A9', // Lawyer
  '0x5663e3E096f1743e77B8F71b5DE0CF9Dfd058523', // Judge
  '0xBCC664B1E6848caba2Eb2f3dE6e21F81b9276dD8', // PFer
  '0xBd888022fF34D2FAa7eA653c6938EC5a33DA124B' // OG PFer
  // '0x92B971d307ebFc7331C23429E204A5E4adF7a833' // Club Pooly's (It's a video :())
])

const ERC721 = [
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'from', type: 'address' },
      { indexed: true, internalType: 'address', name: 'to', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'tokenId', type: 'uint256' }
    ],
    name: 'Transfer',
    type: 'event'
  }
]

const pfpIndexAtom = atomWithStorage<{ [address: string]: number }>('pfpIndex', {})
const pfpImageUriAtom = atomWithStorage<{ [address: string]: string }>('pfpImageUri', {})

export const AccountCardImage = (props: { usersAddress: string }) => {
  const { usersAddress } = props
  const [pfpIndex, setPfpIndex] = useAtom(pfpIndexAtom)
  const [pfpImageUri, setImageUri] = useAtom(pfpImageUriAtom)
  const usersPfpIndex = pfpIndex?.[usersAddress] || 0
  const usersPfpImageUri = pfpImageUri?.[usersAddress]

  const { data, isFetched } = useQuery(
    ['accountIcon', usersAddress, pfpIndex],
    async () => getUsersProfilePicture(usersAddress, usersPfpIndex),
    {
      enabled: !!usersAddress
    }
  )

  useEffect(() => {
    if (!!data?.selected && data?.selected !== usersPfpImageUri) {
      setImageUri({ ...pfpImageUri, [usersAddress]: data?.selected })
    }
  }, [data?.selected])

  if (
    !isFetched ||
    !usersAddress ||
    (isFetched && (data.ownedNfts.length === 0 || data.ownedNfts.length === 1))
  ) {
    return (
      <img
        src={usersPfpImageUri || data?.selected || '/wallet-illustration.png'}
        style={{ width: '65px', height: '60px' }}
        className='rounded-lg'
      />
    )
  }

  return (
    <button
      onClick={() =>
        setPfpIndex({ ...pfpIndex, [usersAddress]: (usersPfpIndex + 1) % data.ownedNfts.length })
      }
      className='hover:opacity-80 transition-opacity'
    >
      <img
        src={usersPfpImageUri || data?.selected || '/wallet-illustration.png'}
        style={{ width: '65px', height: '60px' }}
        className='rounded-lg'
      />
    </button>
  )
}

const getUsersProfilePicture = async (usersAddress: string, pfpIndex: number = 0) => {
  if (!usersAddress) return { selected: '/wallet-illustration.png', ownedNfts: [] }

  const provider = getReadProvider(CHAIN_ID.mainnet)
  const etherplexContracts = NFTS.map((address) => contract(address, ERC721, address))
  const balanceRequests = etherplexContracts.map((nftContract) =>
    nftContract.balanceOf(usersAddress)
  )
  const balanceResults = await batch(provider, ...balanceRequests)

  const ownedNfts = NFTS.filter((address) => {
    const balance: BigNumber = BigNumber.from(balanceResults[address].balanceOf[0])
    return !balance.isZero()
  })

  const selectedNft = ownedNfts[pfpIndex % ownedNfts.length]
  const ethersContract = new Contract(selectedNft, ERC721, provider)

  const response = await ethersContract.queryFilter(
    ethersContract.filters.Transfer(null, usersAddress)
  )

  let tokenDataUri = await ethersContract.tokenURI(response[0].args.tokenId)

  if (tokenDataUri.startsWith('ipfs://')) {
    tokenDataUri = `https://ipfs.io/ipfs/${tokenDataUri.substring(7)}`
  }

  const imageData = await (await fetch(tokenDataUri)).json()
  let imageUri: string = imageData.image

  if (imageUri.startsWith('ipfs://')) {
    imageUri = `https://ipfs.io/ipfs/${imageUri.substring(7)}`
  }

  return { selected: imageUri, ownedNfts }
}

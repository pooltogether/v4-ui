import { TransparentSelect } from '@components/Input/TransparentSelect'
import {
  PayWithCoinbaseButton,
  TemporaryWarningForNoOnRamp
} from '@components/Modal/BuyTokensModal'
import { LargestPrizeInNetwork } from '@components/PrizePoolNetwork/LargestPrizeInNetwork'
import { TotalNumberOfPrizes } from '@components/PrizePoolNetwork/TotalNumberOfPrizes'
import { UpcomingPerDrawPrizeValue } from '@components/PrizePoolNetwork/UpcomingPerDrawPrizeValue'
import { BRIDGE_URLS, EXCHANGE_URLS, getBridges, getExchange } from '@constants/config'
import { useSelectedPrizePool } from '@hooks/v4/PrizePool/useSelectedPrizePool'
import { usePrizePoolTokens } from '@pooltogether/hooks'
import {
  ButtonLink,
  ButtonSize,
  ButtonTheme,
  ExternalLink,
  LinkTheme,
  ModalWithViewState,
  ViewProps
} from '@pooltogether/react-components'
import { CHAIN_ID, getChainNameByChainId, useWalletChainId } from '@pooltogether/wallet-connection'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

enum ViewIds {
  help,
  getTokens,
  buyTokens,
  swapTokens,
  bridgeTokens
}

export const HelpButtons = () => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedViewId, setSelectedViewId] = useState<string | number>(ViewIds.help)
  const router = useRouter()

  const views = [
    {
      id: ViewIds.help,
      view: HelpView,
      title: 'PoolTogether FAQ'
    },
    {
      id: ViewIds.getTokens,
      view: GetTokensView,
      title: 'Get Tokens'
    }
  ]

  return (
    <div className='grid grid-cols-2 space-x-6 mx-auto'>
      <ModalTrigger
        icon={'dollar-sign'}
        label={'Get tokens'}
        onClick={() => {
          setSelectedViewId(ViewIds.getTokens)
          setIsOpen(true)
        }}
      />
      <ModalTrigger
        icon={'help-circle'}
        label={t('help', 'Help')}
        onClick={() => {
          setSelectedViewId(ViewIds.help)
          setIsOpen(true)
        }}
      />
      <ModalWithViewState
        router={router}
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        label={'Help modal'}
        viewIds={ViewIds}
        views={views}
        selectedViewId={selectedViewId}
        setSelectedViewId={setSelectedViewId}
      />
    </div>
  )
}

const HelpView = (props: ViewProps) => {
  const { setSelectedViewId } = props
  return (
    <>
      <Link href='/account'>
        <a>account</a>
      </Link>
      <h4>What is PoolTogether?</h4>
      <p className='opacity-80 mb-6'>
        PoolTogether is a crypto-powered savings protocol based on{' '}
        <ExternalLink theme={LinkTheme.accent} href='https://en.wikipedia.org/wiki/Premium_Bond'>
          Premium Bonds
        </ExternalLink>
        .
      </p>
      <h4>How do I win?</h4>
      <p className='opacity-80 mb-6'>
        When you deposit into a PoolTogether Prize Pool you'll have a <b>{'daily'}</b> chance to win
        some of the{' '}
        <b className='animate-rainbow'>
          <TotalNumberOfPrizes />
        </b>{' '}
        prizes. There's{' '}
        <b className='animate-rainbow'>
          <UpcomingPerDrawPrizeValue />
        </b>{' '}
        to be won and everyone has a chance to win the <b>Grand Prize </b>of{' '}
        <b className='animate-rainbow'>
          <LargestPrizeInNetwork />
        </b>
        .
      </p>
      <h4>How do I deposit?</h4>
      <p className='opacity-80 mb-6'>
        To deposit into PoolTogether you'll need a{' '}
        <ExternalLink
          theme={LinkTheme.accent}
          href={'https://docs.ethhub.io/using-ethereum/wallets/intro-to-ethereum-wallets/'}
        >
          wallet
        </ExternalLink>{' '}
        and some{' '}
        <button
          className='text-pt-teal hover:text-white '
          onClick={() => setSelectedViewId(ViewIds.getTokens)}
        >
          <span>tokens</span>
          {/* <FeatherIcon icon='chevron-right' className='w-4 h-4 inline-block' /> */}
        </button>
        .
      </p>

      <h4>Still have questions?</h4>
      <p className='opacity-80'>
        Check out our{' '}
        <ExternalLink
          theme={LinkTheme.accent}
          href={'https://docs.pooltogether.com/welcome/getting-started'}
        >
          user guide
        </ExternalLink>{' '}
        or chat with us on{' '}
        <ExternalLink theme={LinkTheme.accent} href={'https://pooltogether.com/discord'}>
          Discord
        </ExternalLink>
      </p>
    </>
  )
}

const COINBASE_CHAINS = Object.freeze([CHAIN_ID.mainnet, CHAIN_ID.polygon, CHAIN_ID.avalanche])
const SWAP_TOKENS_CHAINS = Object.keys(EXCHANGE_URLS).map(Number)
const BRIDGE_TOKENS_CHAINS = Object.keys(BRIDGE_URLS).map(Number)

const GetTokensView = () => {
  return (
    <>
      <p className='mb-6'>
        To deposit into PoolTogether you will need some{' '}
        <ExternalLink
          theme={LinkTheme.accent}
          href='https://ethereum.org/en/developers/docs/standards/tokens/erc-20/#introduction'
        >
          tokens
        </ExternalLink>{' '}
        to pay{' '}
        <ExternalLink
          theme={LinkTheme.accent}
          href='https://ethereum.org/en/developers/docs/gas/#what-is-gas'
        >
          gas fees
        </ExternalLink>{' '}
        and some tokens to deposit and save! Check out the options below to see which way of getting
        tokens suites you best.
      </p>
      <div className='space-y-6 xs:space-y-10 sm:space-y-12'>
        <BuyTokens />
        <SwapTokens />
        <BridgeTokens />
      </div>
    </>
  )
}

const BuyTokens = () => {
  const walletChainId = useWalletChainId()
  const [chainId, setChainId] = useState(
    !!walletChainId && COINBASE_CHAINS.includes(walletChainId) ? walletChainId : COINBASE_CHAINS[0]
  )

  return (
    <div>
      <div className='flex space-x-2 items-center mb-2'>
        <h4>Buy Tokens</h4>
        <FeatherIcon icon={'dollar-sign'} className='relative w-5 h-5 inline-block' />
      </div>
      <p className='opacity-80 mb-1'>
        Purchase tokens on an exchange and withdraw them to your personal wallet.{' '}
      </p>
      <p className='opacity-80 mb-4'>
        Buy tokens on{' '}
        <TransparentSelect
          name='cbChain'
          id='cbChain'
          onChange={(event) => setChainId(Number(event.target.value))}
          value={chainId}
        >
          {COINBASE_CHAINS.map((chainId) => (
            <option key={`cb-opt-${chainId}`} value={chainId}>
              {getChainNameByChainId(chainId)}
            </option>
          ))}
        </TransparentSelect>{' '}
      </p>
      <PayWithCoinbaseButton className='w-full xs:w-3/4' chainId={chainId} />
      <TemporaryWarningForNoOnRamp chainId={chainId} />
    </div>
  )
}

const SwapTokens = () => {
  const walletChainId = useWalletChainId()
  const [chainId, setChainId] = useState(
    !!walletChainId && SWAP_TOKENS_CHAINS.includes(walletChainId)
      ? walletChainId
      : SWAP_TOKENS_CHAINS[0]
  )

  const { url, title } = getExchange(chainId)

  return (
    <div>
      <div className='flex items-center space-x-2'>
        <h4>Swap Tokens</h4>
        <FeatherIcon icon={'refresh-cw'} className='relative w-5 h-5 inline-block' />
      </div>
      <p className='opacity-80 mb-1'>
        Trade tokens you already have for others on a centralized exchange or swap using a
        decentralized exchange.
      </p>
      <p className='opacity-80 mb-4'>
        Swap on{' '}
        <TransparentSelect
          name='cbChain'
          id='cbChain'
          onChange={(event) => setChainId(Number(event.target.value))}
          value={chainId}
        >
          {SWAP_TOKENS_CHAINS.map((chainId) => (
            <option key={`swap-opt-${chainId}`} value={chainId}>
              {getChainNameByChainId(chainId)}
            </option>
          ))}
        </TransparentSelect>
      </p>
      <ButtonLink
        // size={ButtonSize.sm}
        className='space-x-1 w-full xs:w-3/4'
        theme={ButtonTheme.teal}
        key={`${chainId}-${title}`}
        href={url}
        target='_blank'
        rel='noopener noreferrer'
      >
        <span className='text-sm'>Swap with {title}</span>
        <FeatherIcon icon={'arrow-up-right'} className='relative w-4 h-4 inline-block' />
      </ButtonLink>
    </div>
  )
}

const BridgeTokens = () => {
  const walletChainId = useWalletChainId()
  const [chainId, setChainId] = useState(
    !!walletChainId && BRIDGE_TOKENS_CHAINS.includes(walletChainId)
      ? walletChainId
      : BRIDGE_TOKENS_CHAINS[0]
  )

  return (
    <div>
      <div className='flex space-x-2 items-center'>
        <h4>Bridge Tokens</h4>
        <div className='-space-x-3'>
          <FeatherIcon icon={'arrow-left'} className='relative w-5 h-5 inline-block' />
          <FeatherIcon icon={'arrow-right'} className='relative w-5 h-5 inline-block' />
        </div>
      </div>
      <p className='opacity-80 mb-1'>
        <ExternalLink
          href='https://ethereum.org/en/developers/docs/bridges/'
          theme={LinkTheme.accent}
        >
          Move tokens
        </ExternalLink>{' '}
        you already have from one blockchain to another.
      </p>
      <p className='opacity-80 mb-4'>
        Bridge from{' '}
        <TransparentSelect
          name='cbChain'
          id='cbChain'
          onChange={(event) => setChainId(Number(event.target.value))}
          value={chainId}
        >
          {BRIDGE_TOKENS_CHAINS.map((chainId) => (
            <option key={`swap-opt-${chainId}`} value={chainId}>
              {getChainNameByChainId(chainId)}
            </option>
          ))}
        </TransparentSelect>
      </p>
      <div className='flex flex-col space-y-2'>
        {getBridges(chainId).map(({ title, url }) => (
          <ButtonLink
            className='space-x-1 w-full xs:w-3/4'
            theme={ButtonTheme.teal}
            key={`${chainId}-${title}`}
            href={url}
            target='_blank'
            rel='noopener noreferrer'
          >
            <span className='text-sm'>Bridge with {title}</span>
            <FeatherIcon icon={'arrow-up-right'} className='relative w-4 h-4 inline-block' />
          </ButtonLink>
        ))}
      </div>
    </div>
  )
}

const ModalTrigger: React.FC<{
  onClick: () => void
  icon: React.ReactNode
  label: React.ReactNode
}> = (props) => (
  <button
    className='text-xxs text-inverse opacity-75 hover:opacity-100 transition-opacity items-center flex flex-row space-x-1'
    onClick={props.onClick}
  >
    <FeatherIcon icon={props.icon} className='relative w-4 h-4 inline-block' />
    <span>{props.label}</span>
  </button>
)

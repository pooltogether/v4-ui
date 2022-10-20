import { CBPayInstanceType, initOnRamp } from '@coinbase/cbpay-js'
import { TransparentSelect } from '@components/Input/TransparentSelect'
import { LargestPrizeInNetwork } from '@components/PrizePoolNetwork/LargestPrizeInNetwork'
import { TotalNumberOfPrizes } from '@components/PrizePoolNetwork/TotalNumberOfPrizes'
import { UpcomingPerDrawPrizeValue } from '@components/PrizePoolNetwork/UpcomingPerDrawPrizeValue'
import { COINBASE_CHAIN_KEYS, getCoinbaseChainAssets, getCoinbaseChainKey } from '@constants/config'
import { BRIDGE_URLS, EXCHANGE_URLS, getBridges, getExchange } from '@constants/config'
import { URL_QUERY_KEY } from '@constants/urlQueryKeys'
import { useQueryParamState } from '@hooks/useQueryParamState'
import {
  BottomSheetWithViewState,
  ButtonLink,
  ButtonTheme,
  ExternalLink,
  LinkTheme,
  Tabs,
  ViewProps
} from '@pooltogether/react-components'
import { getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import {
  CHAIN_ID,
  useUsersAddress,
  getChainNameByChainId,
  useWalletChainId
} from '@pooltogether/wallet-connection'
import { FathomEvent, logEvent } from '@utils/services/fathom'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

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
      <BottomSheetWithViewState
        header='PoolTogether FAQ'
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
        <b className='text-flashy'>
          <TotalNumberOfPrizes />
        </b>{' '}
        prizes. There's{' '}
        <b className='text-flashy'>
          <UpcomingPerDrawPrizeValue />
        </b>{' '}
        to be won and everyone has a chance to win the <b>Grand Prize </b>of{' '}
        <b className='text-flashy'>
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
  const { data: initialTabId, setData } = useQueryParamState(URL_QUERY_KEY.getTokens, 'buy', [
    'buy',
    'swap',
    'bridge'
  ])

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
      <Tabs
        titleClassName='mb-8'
        initialTabId={initialTabId}
        onTabSelect={(tab) => setData(tab.id)}
        tabs={[
          {
            id: 'buy',
            view: <BuyTokens />,
            title: (
              <div className='flex space-x-2 items-center'>
                <span>Buy</span>
                <FeatherIcon icon={'dollar-sign'} className='relative w-5 h-5 inline-block' />
              </div>
            )
          },
          {
            id: 'swap',
            view: <SwapTokens />,
            title: (
              <div className='flex space-x-2 items-center'>
                <span>Swap</span>
                <FeatherIcon icon={'refresh-cw'} className='relative w-5 h-5 inline-block' />
              </div>
            )
          },
          {
            id: 'bridge',
            view: <BridgeTokens />,
            title: (
              <div className='flex space-x-2 items-center'>
                <span>Bridge</span>
                <div className='-space-x-3'>
                  <FeatherIcon icon={'arrow-left'} className='relative w-5 h-5 inline-block' />
                  <FeatherIcon icon={'arrow-right'} className='relative w-5 h-5 inline-block' />
                </div>
              </div>
            )
          }
        ]}
      />
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

const PayWithCoinbaseButton: React.FC<{ chainId: number; className?: string }> = (props) => {
  const { chainId, className } = props
  const [onRampInstance, setOnRampInstance] = useState<CBPayInstanceType | undefined>()
  const usersAddress = useUsersAddress()
  const { t } = useTranslation()
  const chainKey = getCoinbaseChainKey(chainId)
  const supportedCoinbaseChainIds = Object.keys(COINBASE_CHAIN_KEYS).map(Number)

  useEffect(() => {
    initOnRamp(
      {
        appId: process.env.NEXT_PUBLIC_COINBASE_PAY_APP_ID,
        widgetParameters: {
          destinationWallets: !!chainKey
            ? [
                {
                  address: usersAddress,
                  blockchains: [chainKey],
                  assets: getCoinbaseChainAssets(chainId)
                }
              ]
            : supportedCoinbaseChainIds.map((chainId) => ({
                address: usersAddress,
                blockchains: [getCoinbaseChainKey(chainId)],
                assets: getCoinbaseChainAssets(chainId)
              }))
        },
        experienceLoggedIn: 'popup',
        experienceLoggedOut: 'popup',
        closeOnExit: true,
        closeOnSuccess: true,
        onSuccess: () => {
          logEvent(FathomEvent.buyCoinbasePay)
        }
      },
      (_, instance) => {
        setOnRampInstance(instance)
      }
    )

    return () => {
      onRampInstance?.destroy()
      setOnRampInstance(undefined)
    }
  }, [])

  const handleClick = () => {
    onRampInstance?.open()
  }

  const disabled = !process.env.NEXT_PUBLIC_COINBASE_PAY_APP_ID || !onRampInstance

  return (
    <a
      id='cbpay-button-container'
      className={classNames(
        className,
        'flex text-xl items-center space-x-2 transition hover:opacity-90',
        {
          'opacity-50 pointer-events-none': disabled
        }
      )}
      onClick={handleClick}
    >
      <img src={'/buy-with-coinbase-pay.png'} />
    </a>
  )
}

export const TemporaryWarningForNoOnRamp: React.FC<{ chainId: number }> = (props) => {
  const { chainId } = props
  const usersAddress = useUsersAddress()
  const chainKey = getCoinbaseChainKey(chainId)
  const { t } = useTranslation()

  if (!chainKey) {
    return (
      <div className='text-xxxs xs:text-xxs text-pt-red-light mt-4 xs:mt-6'>
        {t('coinbasePayWarning', {
          networkName: getNetworkNiceNameByChainId(chainId),
          supportedNetworks: `${getNetworkNiceNameByChainId(
            CHAIN_ID.mainnet
          )}, ${getNetworkNiceNameByChainId(CHAIN_ID.avalanche)}, ${getNetworkNiceNameByChainId(
            CHAIN_ID.polygon
          )} `
        })}
      </div>
    )
  } else if (!usersAddress) {
    return (
      <div className='text-xxxs xs:text-xxs text-pt-red-light mt-4 xs:mt-6'>
        {t('connectAWalletToProceed', 'Connect a wallet to proceed.')}
      </div>
    )
  }
  return null
}

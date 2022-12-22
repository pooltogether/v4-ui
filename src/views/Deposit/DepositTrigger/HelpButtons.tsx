import { generateOnRampURL } from '@coinbase/cbpay-js'
import { TransparentSelect } from '@components/Input/TransparentSelect'
import { LargestPrizeInNetwork } from '@components/PrizePoolNetwork/LargestPrizeInNetwork'
import { TotalNumberOfPrizes } from '@components/PrizePoolNetwork/TotalNumberOfPrizes'
import { UpcomingPerDrawPrizeValue } from '@components/PrizePoolNetwork/UpcomingPerDrawPrizeValue'
import {
  COINBASE_CHAIN_KEYS,
  ON_RAMP_URLS,
  getCoinbaseChainAssets,
  getCoinbaseChainKey,
  getOnRamp,
  getOnRamps
} from '@constants/config'
import { BRIDGE_URLS, EXCHANGE_URLS, getBridges, getExchange } from '@constants/config'
import { URL_QUERY_KEY } from '@constants/urlQueryKeys'
import { useQueryParamState } from '@hooks/useQueryParamState'
import {
  BottomSheetWithViewState,
  Button,
  ButtonLink,
  ButtonTheme,
  ExternalLink,
  LinkTheme,
  Tabs,
  ViewProps
} from '@pooltogether/react-components'
import { dedupeArray, getNetworkNiceNameByChainId } from '@pooltogether/utilities'
import {
  CHAIN_ID,
  useUsersAddress,
  getChainNameByChainId,
  useWalletChainId
} from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { Trans, useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useMemo, useState } from 'react'

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
      header: 'PoolTogether FAQ'
    },
    {
      id: ViewIds.getTokens,
      view: GetTokensView,
      header: t('getTokens')
    }
  ]

  return (
    <div className='grid grid-cols-2 space-x-6 mx-auto'>
      <ModalTrigger
        icon={'dollar-sign'}
        label={t('getTokens')}
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
  const { t } = useTranslation()
  return (
    <>
      <h4>{t('whatIsPoolTogether')}</h4>
      <p className='opacity-80 mb-6'>
        <Trans
          i18nKey='ptExplainer'
          components={{
            a: (
              <ExternalLink
                children={undefined}
                theme={LinkTheme.accent}
                href='https://en.wikipedia.org/wiki/Premium_Bond'
              />
            )
          }}
        />
      </p>
      <h4>{t('howDoIWin')}</h4>
      <p className='opacity-80 mb-6'>
        <Trans
          i18nKey={'howDoIWinExplainer'}
          components={{
            prizeFrequency: t('daily'),
            numberOfPrizes: <TotalNumberOfPrizes />,
            perDrawPrizeValue: <UpcomingPerDrawPrizeValue />,
            grandPrizeValue: <LargestPrizeInNetwork />,
            style: <b className='text-flashy' />,
            b: <b />
          }}
        />
      </p>
      <h4>{t('howDoIDeposit')}</h4>
      <p className='opacity-80 mb-6'>
        <Trans
          i18nKey='howDoIDepositExplainer'
          components={{
            a: (
              <ExternalLink
                children={undefined}
                theme={LinkTheme.accent}
                href={'https://docs.ethhub.io/using-ethereum/wallets/intro-to-ethereum-wallets/'}
              />
            ),
            button: (
              <button
                className='text-pt-teal hover:text-white '
                onClick={() => setSelectedViewId(ViewIds.getTokens)}
              />
            )
          }}
        />
      </p>

      <h4>{t('stillHaveQuestions')}</h4>
      <p className='opacity-80'>
        <Trans
          i18nKey='stillHaveQuestionsExplainer'
          components={{
            a: (
              <ExternalLink
                children={undefined}
                theme={LinkTheme.accent}
                href={'https://docs.pooltogether.com/welcome/getting-started'}
              />
            ),
            discordLink: (
              <ExternalLink
                children={undefined}
                theme={LinkTheme.accent}
                href={'https://pooltogether.com/discord'}
              />
            )
          }}
        />
      </p>
    </>
  )
}

const COINBASE_CHAINS = Object.freeze([CHAIN_ID.mainnet, CHAIN_ID.polygon, CHAIN_ID.avalanche])
const BUY_TOKENS_CHAINS = dedupeArray([
  ...Object.keys(ON_RAMP_URLS).map(Number),
  ...COINBASE_CHAINS
])
const SWAP_TOKENS_CHAINS = Object.keys(EXCHANGE_URLS).map(Number)
const BRIDGE_TOKENS_CHAINS = Object.keys(BRIDGE_URLS).map(Number)

const GetTokensView = () => {
  const { data: initialTabId, setData } = useQueryParamState(URL_QUERY_KEY.getTokens, 'buy', [
    'buy',
    'swap',
    'bridge'
  ])

  const { t } = useTranslation()

  return (
    <>
      <p className='mb-6'>
        <Trans
          i18nKey={'getTokensExplainer'}
          components={{
            a: (
              <ExternalLink
                children={undefined}
                theme={LinkTheme.accent}
                href='https://ethereum.org/en/developers/docs/standards/tokens/erc-20/#introduction'
              />
            ),
            a2: (
              <ExternalLink
                children={undefined}
                theme={LinkTheme.accent}
                href='https://ethereum.org/en/developers/docs/gas/#what-is-gas'
              />
            )
          }}
        />
      </p>
      <Tabs
        titleClassName='mb-4'
        initialTabId={initialTabId}
        onTabSelect={(tab) => setData(tab.id)}
        tabs={[
          {
            id: 'buy',
            view: <BuyTokens />,
            title: (
              <div className='flex space-x-2 items-center'>
                <span>{t('buy')}</span>
                <FeatherIcon icon={'dollar-sign'} className='relative w-5 h-5 inline-block' />
              </div>
            )
          },
          {
            id: 'swap',
            view: <SwapTokens />,
            title: (
              <div className='flex space-x-2 items-center'>
                <span>{t('swap')}</span>
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
    !!walletChainId && BUY_TOKENS_CHAINS.includes(walletChainId) ? walletChainId : CHAIN_ID.mainnet
  )
  const { t } = useTranslation()

  return (
    <div>
      <p className='opacity-80 mb-8'>{t('buyTokensExplainer')}</p>
      <p className='opacity-80 mb-4'>
        {t('buyTokensOn')}{' '}
        <TransparentSelect
          name='cbChain'
          id='cbChain'
          onChange={(event) => setChainId(Number(event.target.value))}
          value={chainId}
        >
          {BUY_TOKENS_CHAINS.map((chainId) => (
            <option key={`cb-opt-${chainId}`} value={chainId} className='dark:bg-pt-purple'>
              {getChainNameByChainId(chainId)}
            </option>
          ))}
        </TransparentSelect>{' '}
      </p>
      {COINBASE_CHAINS.includes(chainId) && (
        <div className='mb-2'>
          <ExternalLink
            className='text-xxs'
            href='https://docs.pooltogether.com/pooltogether/guides/using-coinbase-pay'
          >
            {t('userGuide')}
          </ExternalLink>
          <PayWithCoinbaseButton className='w-full' chainId={chainId} />
        </div>
      )}
      <div className='flex flex-col space-y-2'>
        {getOnRamps(chainId)?.map(({ title, url }) => (
          <ButtonLink
            className='space-x-1 w-full'
            theme={ButtonTheme.teal}
            key={`${chainId}-${title}`}
            href={url}
            target='_blank'
            rel='noopener noreferrer'
          >
            <span className='text-sm'>{t('buyWith', { onRamp: title })}</span>
            <FeatherIcon icon={'arrow-up-right'} className='relative w-4 h-4 inline-block' />
          </ButtonLink>
        ))}
      </div>
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
  const { t } = useTranslation()

  const { url, title } = getExchange(chainId)

  return (
    <div>
      <p className='opacity-80 mb-8'>{t('swapTokensExplainer')}</p>
      <p className='opacity-80 mb-4'>
        {t('swapOn')}{' '}
        <TransparentSelect
          name='cbChain'
          id='cbChain'
          onChange={(event) => setChainId(Number(event.target.value))}
          value={chainId}
        >
          {SWAP_TOKENS_CHAINS.map((chainId) => (
            <option key={`swap-opt-${chainId}`} value={chainId} className='dark:bg-pt-purple'>
              {getChainNameByChainId(chainId)}
            </option>
          ))}
        </TransparentSelect>
      </p>
      <ButtonLink
        // size={ButtonSize.sm}
        className='space-x-1 w-full'
        theme={ButtonTheme.teal}
        key={`${chainId}-${title}`}
        href={url}
        target='_blank'
        rel='noopener noreferrer'
      >
        <span className='text-sm'>{t('swapWithExchange', { exchange: title })}</span>
        <FeatherIcon icon={'arrow-up-right'} className='relative w-4 h-4 inline-block' />
      </ButtonLink>
    </div>
  )
}

const BridgeTokens = () => {
  const walletChainId = useWalletChainId()
  const { t } = useTranslation()
  const [chainId, setChainId] = useState(
    !!walletChainId && BRIDGE_TOKENS_CHAINS.includes(walletChainId)
      ? walletChainId
      : BRIDGE_TOKENS_CHAINS[0]
  )

  return (
    <div>
      <p className='opacity-80 mb-8'>
        <Trans
          i18nKey='bridgeExplainer'
          components={{
            a: (
              <ExternalLink
                href='https://ethereum.org/en/developers/docs/bridges/'
                theme={LinkTheme.accent}
                children={undefined}
              />
            )
          }}
        />
      </p>
      <p className='opacity-80 mb-4'>
        {t('bridgeFrom')}{' '}
        <TransparentSelect
          name='cbChain'
          id='cbChain'
          onChange={(event) => setChainId(Number(event.target.value))}
          value={chainId}
        >
          {BRIDGE_TOKENS_CHAINS.map((chainId) => (
            <option key={`swap-opt-${chainId}`} value={chainId} className='dark:bg-pt-purple'>
              {getChainNameByChainId(chainId)}
            </option>
          ))}
        </TransparentSelect>
      </p>
      <div className='flex flex-col space-y-2'>
        {getBridges(chainId).map(({ title, url }) => (
          <ButtonLink
            className='space-x-1 w-full'
            theme={ButtonTheme.teal}
            key={`${chainId}-${title}`}
            href={url}
            target='_blank'
            rel='noopener noreferrer'
          >
            <span className='text-sm'>{t('bridgeWith', { bridge: title })}</span>
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

// TODO: Refetch users token balances on successful purchase
const PayWithCoinbaseButton: React.FC<{ chainId: number; className?: string }> = (props) => {
  const { chainId, className } = props
  const usersAddress = useUsersAddress()
  const { t } = useTranslation()
  const chainKey = getCoinbaseChainKey(chainId)
  const supportedCoinbaseChainIds = Object.keys(COINBASE_CHAIN_KEYS).map(Number)

  const url = useMemo(
    () =>
      generateOnRampURL({
        appId: process.env.NEXT_PUBLIC_COINBASE_PAY_APP_ID,
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
      }),
    [chainId, chainKey, supportedCoinbaseChainIds, usersAddress]
  )

  return (
    <ButtonLink
      id='cbpay-button-container'
      href={url}
      className={classNames('space-x-1 w-full', className)}
      theme={ButtonTheme.blue}
      target='_blank'
      rel='noopener'
    >
      <span className='text-sm'>{t('buyWithCoinbasePay')}</span>
      <FeatherIcon icon={'arrow-up-right'} className='relative w-4 h-4 inline-block' />
    </ButtonLink>
  )
}

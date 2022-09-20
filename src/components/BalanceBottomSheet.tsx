import { Amount, Token } from '@pooltogether/hooks'
import {
  BottomSheet,
  CountUp,
  ModalTitle,
  SquareButton,
  SquareButtonTheme,
  SquareLink,
  TokenIcon,
  Tooltip
} from '@pooltogether/react-components'
import {
  getNetworkNiceNameByChainId,
  numberWithCommas,
  getMaxPrecision,
  addUsdcTicketTokenToMetaMask
} from '@pooltogether/utilities'
import { BlockExplorerLink, useIsWalletMetamask } from '@pooltogether/wallet-connection'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'

enum DefaultViews {
  main = 'main',
  moreInfo = 'moreInfo'
}

export interface Link {
  id: string
  label: React.ReactNode
  href: string
}

export interface View {
  id: string
  label: React.ReactNode
  view: (props: Partial<MainViewProps & MoreInfoViewProps>) => JSX.Element
  icon?: string
  disabled?: boolean
  theme?: SquareButtonTheme
}

export interface BalanceBottomSheetProps extends MainViewProps, MoreInfoViewProps {
  open: boolean
  onDismiss: () => void
  label?: string
  className?: string
}

export const BalanceBottomSheet = (props: BalanceBottomSheetProps) => {
  const { open, onDismiss, className, label, ...viewProps } = props
  const [selectedView, setSelectedView] = useState<string>(DefaultViews.main)

  const View = useMemo(
    () => getView(selectedView, props.views, props.moreInfoViews),
    [props.moreInfoViews, props.views, selectedView]
  )

  return (
    <BottomSheet
      label={label}
      open={open}
      onDismiss={() => {
        onDismiss()
        setSelectedView(DefaultViews.main)
      }}
      className={classNames(className, 'text-inverse dark:text-white')}
    >
      <View {...viewProps} setView={setSelectedView} />
      <BalanceBottomSheetBackButton
        selectedView={selectedView}
        onClick={() => setSelectedView(DefaultViews.main)}
      />
    </BottomSheet>
  )
}

BalanceBottomSheet.defaultProps = {
  label: 'balance-bottom-sheet'
}

export const BalanceBottomSheetBackButton = (props: {
  onClick: () => void
  selectedView: string
}) => {
  const { onClick, selectedView } = props
  const { t } = useTranslation()

  if (selectedView === DefaultViews.main) return null

  return (
    <button
      onClick={onClick}
      className='font-bold text-lg absolute top-6 left-4 xs:top-2 xs:left-6 flex opacity-50 hover:opacity-100 transition-opacity m-0'
    >
      <FeatherIcon icon='chevron-left' className='my-auto h-6 w-6' />
      {t('back')}
    </button>
  )
}

interface MainViewProps {
  chainId: number
  ticket: Token
  token: Token
  balance: Amount
  balanceUsd: Amount
  contractLinks: ContractLink[]
  title: string
  transactionHash?: string
  views?: View[]
  internalLinks?: JSX.Element
  externalLinks?: Link[]
  banner?: React.ReactNode
}

const MainView = (props: MainViewProps & { setView: (view: string) => void }) => {
  const {
    chainId,
    transactionHash,
    views,
    ticket,
    balance,
    balanceUsd,
    setView,
    title,
    banner,
    internalLinks,
    externalLinks
  } = props
  const { t } = useTranslation()

  return (
    <>
      <ModalTitle chainId={chainId} title={title} className='mb-4' />

      {banner}

      <div className='bg-white dark:bg-actually-black dark:bg-opacity-10 rounded-xl w-full py-6 flex flex-col mb-4'>
        <span
          className={classNames('text-3xl mx-auto font-bold leading-none', {
            'opacity-50': balance.amountUnformatted.isZero()
          })}
        >
          $<CountUp countTo={Number(balanceUsd.amount)} />
        </span>
        <span className='mx-auto flex mt-1'>
          <Tooltip
            id={`balance-bottom-sheet-key-${Math.random()}`}
            tip={
              <>
                {numberWithCommas(balance.amount, { precision: getMaxPrecision(balance.amount) })}{' '}
                {ticket.symbol}
              </>
            }
          >
            <TokenIcon chainId={chainId} address={ticket.address} sizeClassName='w-4 h-4 my-auto' />
            <span className='font-bold opacity-50 mx-1'>{numberWithCommas(balance.amount)}</span>
            <span className='opacity-50'>{ticket.symbol}</span>
          </Tooltip>
        </span>
      </div>

      <TxReceipt chainId={chainId} transactionHash={transactionHash} className='mb-4' />

      <div className='flex flex-col space-y-4'>
        {internalLinks}

        {externalLinks?.map((externalLink) => (
          <SquareLink
            key={externalLink.id}
            href={externalLink.href}
            chevron
            className='flex justify-center'
          >
            {externalLink.label}
          </SquareLink>
        ))}

        {views?.map((view) => (
          <ViewButton key={view.id} {...view} setView={setView} />
        ))}

        <button
          onClick={() => setView(DefaultViews.moreInfo)}
          className='font-bold pt-2 hover:opacity-50 transition-opacity'
        >
          {t('moreInfo')}
        </button>
      </div>
    </>
  )
}

interface ViewButtonProps extends View {
  setView: (view: string) => void
}

const ViewButton = (props: ViewButtonProps) => {
  const { disabled, id, label, icon, theme, setView } = props
  return (
    <SquareButton disabled={disabled} theme={theme} onClick={() => setView(id)}>
      {icon && <FeatherIcon icon={icon} className='mr-1 my-auto h-5 w-5' />}
      <span>{label}</span>
    </SquareButton>
  )
}

ViewButton.defaultProps = {
  theme: SquareButtonTheme.tealOutline
}

const getView = (selectedView: string, views: View[], moreInfoViews: View[]) => {
  if (selectedView === DefaultViews.main) {
    return MainView
  } else if (selectedView === DefaultViews.moreInfo) {
    return MoreInfoView
  } else {
    let view =
      views.find((view) => view.id === selectedView) ||
      moreInfoViews.find((view) => view.id === selectedView)
    return view.view
  }
}

export interface ContractLink {
  i18nKey: string
  chainId: number
  address: string
}

interface MoreInfoViewProps {
  chainId: number
  ticket: Token
  token: Token
  contractLinks: ContractLink[]
  moreInfoViews?: View[]
  delegate?: string
  sendRevokeAllowanceTransaction?: () => Promise<string>
  isWalletOnProperNetwork: boolean
}

const MoreInfoView = (
  props: MoreInfoViewProps & {
    setView: (view: string) => void
  }
) => {
  const {
    setView,
    sendRevokeAllowanceTransaction,
    chainId,
    delegate,
    ticket,
    token,
    moreInfoViews,
    contractLinks,
    isWalletOnProperNetwork
  } = props
  const { t } = useTranslation()

  const isWalletMetaMask = useIsWalletMetamask()

  const handleAddTicketToMetaMask = async () => {
    if (!ticket) {
      return
    }

    if (!isWalletOnProperNetwork) {
      toast.warn(
        t('switchToNetworkToAddToken', {
          networkName: getNetworkNiceNameByChainId(chainId),
          token: ticket.symbol
        })
      )
      return null
    }

    return addUsdcTicketTokenToMetaMask(ticket)
  }

  return (
    <>
      <ModalTitle chainId={chainId} title={t('moreInfo')} className='mb-4' />

      {contractLinks.length > 0 && (
        <ul className='bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 rounded-xl w-full p-4 flex flex-col space-y-1 mb-4'>
          <div className='opacity-50 font-bold flex justify-between'>
            <span>{t('contract')}</span>
            <span>{t('explorer')}</span>
          </div>
          {contractLinks.map((contractLink) => (
            <LinkToContractItem
              key={`${contractLink.address}-${contractLink.chainId}`}
              {...contractLink}
            />
          ))}
        </ul>
      )}

      {delegate && (
        <div className='bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 rounded-xl w-full p-4 mb-4 flex justify-between'>
          <span className='text-sm'>{t('delegatingDeposits')}</span>
          <BlockExplorerLink shorten chainId={chainId} address={delegate} className='text-sm' />
        </div>
      )}
      <div className='flex flex-col space-y-4'>
        {moreInfoViews?.map((view) => (
          <ViewButton key={view.id} {...view} setView={setView} />
        ))}

        {isWalletMetaMask && (
          <SquareButton
            onClick={handleAddTicketToMetaMask}
            className='flex w-full items-center justify-center'
          >
            <FeatherIcon icon='plus-circle' className='w-5 h-5 mr-1' />{' '}
            {t('addTicketTokenToMetamask', {
              token: ticket.symbol
            })}
          </SquareButton>
        )}

        {/* {sendRevokeAllowanceTransaction && (
          <RevokeAllowanceButton
            t={t}
            token={token}
            isWalletOnProperNetwork={isWalletOnProperNetwork}
            chainId={chainId}
            sendRevokeAllowanceTransaction={sendRevokeAllowanceTransaction}
          />
        )} */}
      </div>
    </>
  )
}

const TxReceipt = (props: { transactionHash: string; chainId: number; className?: string }) => {
  const { chainId, transactionHash, className } = props
  const { t } = useTranslation()

  if (!transactionHash) return null

  return (
    <div
      className={classNames(
        'bg-white bg-opacity-20 dark:bg-actually-black dark:bg-opacity-10 rounded-xl w-full px-4 py-6 flex justify-between',
        className
      )}
    >
      <span className='font-bold'>{t('transaction')}</span>
      <BlockExplorerLink chainId={chainId} txHash={transactionHash} shorten />
    </div>
  )
}

const LinkToContractItem = (props: { chainId: number; i18nKey: string; address: string }) => {
  const { chainId, i18nKey, address } = props
  const { t } = useTranslation()
  return (
    <li className='w-full flex justify-between'>
      <span className='text-sm'>{t(i18nKey)}</span>
      <BlockExplorerLink shorten chainId={chainId} address={address} className='text-sm' />
    </li>
  )
}

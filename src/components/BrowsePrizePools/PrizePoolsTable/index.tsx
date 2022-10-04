import { TransparentSelect } from '@components/Input/TransparentSelect'
import { AveragePrizeValue } from '@components/PrizePool/AveragePrizeValue'
import { ExpectedTotalPrizeValue } from '@components/PrizePool/ExpectedTotalPrizeValue'
import { NumberOfPrizes } from '@components/PrizePool/NumberOfPrizes'
import { PrizePoolLabel } from '@components/PrizePoolLabel'
import { usePrizePoolsByAvgPrizeValue } from '@hooks/usePrizePoolsByAvgPrizeValue'
import { usePrizePoolsByExpectedTotalPrizeValue } from '@hooks/usePrizePoolsByExpectedTotalPrizeValue'
import { usePrizePoolsByPrizes } from '@hooks/usePrizePoolsByPrizes'
import { usePrizePoolsByTvl } from '@hooks/usePrizePoolsByTvl'
import { Button, ButtonSize, ButtonTheme, Tooltip } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-client-js'
import { LoadingAccountListItem } from '@views/Account/AccountList/AccountListItem'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useState } from 'react'
import { TotalAmountDeposited } from './TotalAmountDeposited'

enum Metrics {
  TVL,
  NUM_PRIZES,
  AVG_PRIZE_VALUE,
  TOTAL_PRIZE_VALUE
}

const Columns: {
  [metric: number]: {
    headerI18nKey: string
    tooltipI18nKey?: string
    view: (props: { prizePool: PrizePool; className: string }) => JSX.Element
  }
} = Object.freeze({
  [Metrics.TVL]: {
    headerI18nKey: 'Total Amount Deposited',
    view: TotalAmountDeposited
  },
  [Metrics.NUM_PRIZES]: {
    headerI18nKey: 'Number of Prizes',
    tooltipI18nKey: 'The expected number of prizes awarded each day.',
    view: (props: { prizePool: PrizePool; className?: string }) => (
      <div className={classNames(props.className)}>
        <NumberOfPrizes prizePool={props.prizePool} />
      </div>
    )
  },
  [Metrics.TOTAL_PRIZE_VALUE]: {
    headerI18nKey: 'Daily Prize Value',
    tooltipI18nKey: 'The expected total value of all of the prizes awarded each day.',
    view: (props: { prizePool: PrizePool; className?: string }) => (
      <div className={classNames(props.className)}>
        <ExpectedTotalPrizeValue prizePool={props.prizePool} />
      </div>
    )
  },
  [Metrics.AVG_PRIZE_VALUE]: {
    headerI18nKey: 'Average Prize Value',
    tooltipI18nKey: 'The average value of all of the expected prizes awarded each day.',
    view: (props: { prizePool: PrizePool; className?: string }) => (
      <div className={classNames(props.className)}>
        <AveragePrizeValue prizePool={props.prizePool} />
      </div>
    )
  }
})

const tableGrid = 'grid gap-x-2 grid-cols-3 sm:grid-cols-4 md:grid-cols-5'
const getHiddenColumnClassNames = (index: number) =>
  classNames('items-center', {
    'inline-flex': index === 0,
    'hidden sm:inline-flex ': index === 1,
    'hidden md:inline-flex': index === 2,
    'hiden lg:inline-flex': index === 3
  })

export const PrizePoolsTable: React.FC<{
  className?: string
  onPrizePoolSelect?: (prizePool: PrizePool) => void
}> = (props) => {
  const { className, onPrizePoolSelect } = props
  const { prizePools: prizePoolsByTvl, isFetched: isPrizePoolsByTvlFetched } = usePrizePoolsByTvl()
  const { prizePools: prizePoolsByAvgPrizeValue, isFetched: isPrizePoolsByAvgPrizeValueFetched } =
    usePrizePoolsByAvgPrizeValue()
  const {
    prizePools: prizePoolsByExpectedTotalPrizeValue,
    isFetched: isPrizePoolsByExpectedTotalPrizeValueFetched
  } = usePrizePoolsByExpectedTotalPrizeValue()
  const { prizePools: prizePoolsByPrizes, isFetched: isPrizePoolsByPrizes } =
    usePrizePoolsByPrizes()
  const [selectedIndex, setSelectedIndex] = useState(0)

  const sortOptions = [
    {
      title: 'Popularity',
      description: 'These Prize Pools are the most popular and have the most tokens deposited.',
      prizePools: prizePoolsByTvl,
      isFetched: isPrizePoolsByTvlFetched,
      columns: [
        Columns[Metrics.TVL],
        Columns[Metrics.TOTAL_PRIZE_VALUE],
        Columns[Metrics.NUM_PRIZES]
      ]
    },
    {
      title: 'Daily Prize Value',
      description: 'The more deposits a Prize Pool gets the more prize value it has to give out!',
      prizePools: prizePoolsByExpectedTotalPrizeValue,
      isFetched: isPrizePoolsByExpectedTotalPrizeValueFetched,
      columns: [
        Columns[Metrics.TOTAL_PRIZE_VALUE],
        Columns[Metrics.NUM_PRIZES],
        Columns[Metrics.AVG_PRIZE_VALUE]
      ]
    },
    {
      title: 'Average Prize Value',
      description: "Don't expect to win often, but when you do, it'll be big!",
      prizePools: prizePoolsByAvgPrizeValue,
      isFetched: isPrizePoolsByAvgPrizeValueFetched,
      columns: [
        Columns[Metrics.AVG_PRIZE_VALUE],
        Columns[Metrics.NUM_PRIZES],
        Columns[Metrics.TOTAL_PRIZE_VALUE]
      ]
    },
    {
      title: 'Number of Prizes',
      description: 'The most prizes are awarded here, but the prizes are smaller.',
      prizePools: prizePoolsByPrizes,
      isFetched: isPrizePoolsByPrizes,
      columns: [
        Columns[Metrics.NUM_PRIZES],
        Columns[Metrics.AVG_PRIZE_VALUE],
        Columns[Metrics.TOTAL_PRIZE_VALUE]
      ]
    }
  ]
  const selectedSort = sortOptions[selectedIndex]

  return (
    <div>
      {/* Description & Filter */}
      <div className='flex flex-col-reverse w-full sm:flex-row mb-8'>
        <div className='opacity-80 sm:max-w-lg mt-3 sm:mt-0'>{selectedSort.description}</div>
        <div className='ml-auto flex w-full sm:w-auto'>
          <div className='sm:text-lg font-semibold mr-2 whitespace-nowrap my-auto'>Sort by</div>
          <div className='my-auto w-full'>
            <TransparentSelect
              name='list'
              id='list'
              onChange={(event) => setSelectedIndex(Number(event.target.value))}
              value={selectedIndex}
              paddingClassName='px-4 py-2'
              className='w-full sm:w-auto'
            >
              {sortOptions.map((sortOption, index) => (
                <option key={index} value={index}>
                  {sortOption.title}
                </option>
              ))}
            </TransparentSelect>
          </div>
        </div>
      </div>

      {/* Column Header */}
      <div className={classNames(tableGrid, 'text-xxs mb-2')}>
        <span className='opacity-80'>Prize Pool</span>
        {selectedSort.columns.map((column, index) => (
          <div
            key={`column-header-${index}`}
            className={classNames(getHiddenColumnClassNames(index))}
          >
            <span className='opacity-80'>{column.headerI18nKey}</span>
            {!!column.tooltipI18nKey && (
              <Tooltip
                id={`header-${index}`}
                iconClassName='ml-1 opacity-80'
                tip={column.tooltipI18nKey}
              />
            )}
          </div>
        ))}
      </div>

      {/* Rows */}
      {selectedSort.isFetched ? (
        <div className={classNames(tableGrid, 'gap-y-8')}>
          {selectedSort.prizePools?.map((prizePool) => (
            <>
              {/* Prize Pool Label */}
              <PrizePoolLabel prizePool={prizePool} />
              {/* Passthrough item */}
              {selectedSort.columns.map((column, index) => (
                <column.view
                  key={`column-${index}`}
                  prizePool={prizePool}
                  className={classNames(
                    'text-xxs sm:text-sm font-bold',
                    getHiddenColumnClassNames(index)
                  )}
                />
              ))}
              {/* Join Button */}
              <Button
                size={ButtonSize.sm}
                className='w-full my-auto space-x-2'
                theme={ButtonTheme.transparent}
                onClick={() => onPrizePoolSelect(prizePool)}
              >
                <div className='font-bold hidden sm:block'>Join Prize Pool</div>
                <div className='font-bold block sm:hidden'>Join</div>
                <FeatherIcon icon='chevron-right' className='w-6 h-6 sm:w-4 sm:h-4' />
              </Button>
            </>
          ))}
        </div>
      ) : (
        <ul className={'space-y-2 w-full'}>
          <LoadingAccountListItem />
          <LoadingAccountListItem />
          <LoadingAccountListItem />
        </ul>
      )}
    </div>
  )
}

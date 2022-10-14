import { TransparentSelect } from '@components/Input/TransparentSelect'
import { LoadingListItem } from '@components/List/ListItem'
import { NumberOfPrizes } from '@components/PrizePool/NumberOfPrizes'
import { PrizePoolLabel } from '@components/PrizePool/PrizePoolLabel'
import { Prizes } from '@components/PrizePool/Prizes'
import { URL_QUERY_KEY } from '@constants/urlQueryKeys'
import { usePrizePoolsByAvgPrizeValue } from '@hooks/usePrizePoolsByAvgPrizeValue'
import { usePrizePoolsByExpectedTotalPrizeValue } from '@hooks/usePrizePoolsByExpectedTotalPrizeValue'
import { usePrizePoolsByPrizes } from '@hooks/usePrizePoolsByPrizes'
import { usePrizePoolsByTvl } from '@hooks/usePrizePoolsByTvl'
import { useQueryParamState } from '@hooks/useQueryParamState'
import { Button, ButtonSize, ButtonTheme, Tooltip } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { TotalAmountDeposited } from './TotalAmountDeposited'

enum Metrics {
  TVL = 'TVL',
  PRIZES = 'PRIZES',
  NUM_PRIZES = 'NUM_PRIZES'
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
  // [Metrics.NUM_PRIZES]: {
  //   headerI18nKey: 'Number of Prizes (Projected)',
  //   tooltipI18nKey: 'The expected number of prizes awarded each day.',
  //   view: (props: { prizePool: PrizePool; className?: string }) => (
  //     <div className={classNames(props.className)}>
  //       <NumberOfPrizes prizePool={props.prizePool} />
  //     </div>
  //   )
  // },
  [Metrics.PRIZES]: {
    headerI18nKey: 'Prizes',
    tooltipI18nKey:
      'The potential prizes that can be won! All deposits have a chance to win the Grand Prize.',
    view: (props: { prizePool: PrizePool; className?: string }) => (
      <div className={classNames(props.className)}>
        <Prizes prizePool={props.prizePool} />
      </div>
    )
  }
})

const tableGrid = 'grid gap-x-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
const getHiddenColumnClassNames = (column: string, columns: string[]) => {
  const index = columns.indexOf(column)
  return classNames('items-center', {
    'inline-flex': index === 0,
    'hidden sm:inline-flex ': index === 1,
    'hidden md:inline-flex': index === 2,
    'hiden lg:inline-flex': index === 3
  })
}

export const PrizePoolsTable: React.FC<{
  className?: string
  onPrizePoolSelect?: (prizePool: PrizePool) => void
}> = (props) => {
  const { className, onPrizePoolSelect } = props
  const { prizePools: prizePoolsByTvl, isFetched: isPrizePoolsByTvlFetched } = usePrizePoolsByTvl()
  const { prizePools: prizePoolsByAvgPrizeValue, isFetched: isPrizePoolsByAvgPrizeValueFetched } =
    usePrizePoolsByAvgPrizeValue()
  const { prizePools: prizePoolsByPrizes, isFetched: isPrizePoolsByPrizes } =
    usePrizePoolsByPrizes()

  const sortOptions = [
    {
      title: 'Popularity',
      key: 'popularity',
      description: 'These Prize Pools are the most popular and have the most tokens deposited.',
      prizePools: prizePoolsByTvl,
      isFetched: isPrizePoolsByTvlFetched,
      columnPriority: [Metrics.TVL, Metrics.PRIZES]
    },
    {
      title: 'Average Prize Size',
      key: 'avg_prize',
      description:
        "Some Prize Pools have many small prizes. Others have fewer, but larger prizes. It's up to you!",
      prizePools: prizePoolsByAvgPrizeValue,
      isFetched: isPrizePoolsByAvgPrizeValueFetched,
      columnPriority: [Metrics.PRIZES, Metrics.TVL]
    },
    {
      title: 'Chances to Win',
      key: 'best_chances',
      description: "More prizes means more chances to win every day. It's that simple",
      prizePools: prizePoolsByPrizes,
      isFetched: isPrizePoolsByPrizes,
      columnPriority: [Metrics.PRIZES, Metrics.TVL]
    }
  ]

  const { data, setData } = useQueryParamState(
    URL_QUERY_KEY.sortBy,
    sortOptions[0].key,
    sortOptions.map((option) => option.key)
  )
  const selectedIndex = sortOptions.findIndex((opt) => opt.key === data)
  const selectedSort = sortOptions[selectedIndex]

  const onChange = (index: number) => {
    const selectedOption = sortOptions[index]
    setData(selectedOption.key)
    // setSelectedIndex(index)
  }

  return (
    <div className={className}>
      {/* Description & Filter */}
      <div className='flex flex-col-reverse w-full sm:flex-row mb-8'>
        <div className='opacity-80 sm:max-w-lg mt-3 sm:mt-0'>{selectedSort.description}</div>
        <div className='ml-auto flex w-full sm:w-auto'>
          <div className='sm:text-lg font-semibold mr-2 whitespace-nowrap my-auto'>Sort by</div>
          <div className='my-auto w-full'>
            <TransparentSelect
              name='list'
              id='list'
              onChange={(event) => onChange(Number(event.target.value))}
              value={selectedIndex}
              paddingClassName='px-4 py-2'
              className='w-full sm:w-auto'
            >
              {sortOptions.map((sortOption, index) => (
                <option key={`so-${sortOption.key}-${index}`} value={index}>
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
        {Object.keys(Columns).map((columnKey, index) => (
          <div
            key={`column-header-${index}`}
            className={classNames(
              getHiddenColumnClassNames(columnKey, selectedSort.columnPriority)
            )}
          >
            <span className='opacity-80 flex'>{Columns[columnKey].headerI18nKey}</span>
            {!!Columns[columnKey].tooltipI18nKey && (
              <Tooltip
                id={`header-${index}`}
                iconClassName='ml-1 opacity-80'
                tip={Columns[columnKey].tooltipI18nKey}
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
              <PrizePoolLabel prizePool={prizePool} key={`ppl-${prizePool.id()}`} />
              {/* Passthrough item */}
              {Object.keys(Columns).map((columnKey, index) => {
                const column = Columns[columnKey]
                return (
                  <column.view
                    key={`column-${index}`}
                    prizePool={prizePool}
                    className={classNames(
                      'text-xxs sm:text-sm font-bold',
                      getHiddenColumnClassNames(columnKey, selectedSort.columnPriority)
                    )}
                  />
                )
              })}
              {/* Join Button */}
              <Button
                size={ButtonSize.sm}
                className='w-full my-auto space-x-2'
                theme={ButtonTheme.transparent}
                onClick={() => onPrizePoolSelect(prizePool)}
                key={`pp-join-${prizePool.id()}`}
              >
                <div className='text-xxs xs:text-xs font-bold'>Deposit</div>
                <FeatherIcon icon='chevron-right' className='w-5 h-5 sm:w-4 sm:h-4' />
              </Button>
            </>
          ))}
        </div>
      ) : (
        <ul className={'space-y-2 w-full'}>
          <LoadingListItem />
          <LoadingListItem />
          <LoadingListItem />
        </ul>
      )}
    </div>
  )
}

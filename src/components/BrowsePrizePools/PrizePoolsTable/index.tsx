import { TransparentSelect } from '@components/Input/TransparentSelect'
import { LoadingListItem } from '@components/List/ListItem'
import { PrizePoolLabel } from '@components/PrizePool/PrizePoolLabel'
import { Prizes } from '@components/PrizePool/Prizes'
import { URL_QUERY_KEY } from '@constants/urlQueryKeys'
import { usePrizePoolsByAvgPrizeValue } from '@hooks/usePrizePoolsByAvgPrizeValue'
import { usePrizePoolsByPrizes } from '@hooks/usePrizePoolsByPrizes'
import { usePrizePoolsByTvl } from '@hooks/usePrizePoolsByTvl'
import { useQueryParamState } from '@hooks/useQueryParamState'
import { Button, ButtonSize, ButtonTheme, Tooltip } from '@pooltogether/react-components'
import { PrizePool } from '@pooltogether/v4-client-js'
import classNames from 'classnames'
import FeatherIcon from 'feather-icons-react'
import { useTranslation } from 'next-i18next'
import { TotalAmountDeposited } from './TotalAmountDeposited'

enum Metrics {
  TVL = 'TVL',
  PRIZES = 'PRIZES',
  NUM_PRIZES = 'NUM_PRIZES'
}

const tableGrid = 'grid gap-x-2 grid-cols-3 sm:grid-cols-4'
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
  const { t } = useTranslation()

  const Columns: {
    [metric: number]: {
      header: string
      tooltip?: string
      view: (props: { prizePool: PrizePool; className: string }) => JSX.Element
    }
  } = Object.freeze({
    [Metrics.TVL]: {
      header: t('totalDeposited'),
      view: TotalAmountDeposited
    },
    // [Metrics.NUM_PRIZES]: {
    //   header: 'Number of Prizes (Projected)',
    //   tooltip: 'The expected number of prizes awarded each day.',
    //   view: (props: { prizePool: PrizePool; className?: string }) => (
    //     <div className={classNames(props.className)}>
    //       <NumberOfPrizes prizePool={props.prizePool} />
    //     </div>
    //   )
    // },
    [Metrics.PRIZES]: {
      header: t('prizes'),
      tooltip: t('prizeTablePrizeToolTip'),
      view: (props: { prizePool: PrizePool; className?: string }) => (
        <div className={classNames(props.className)}>
          <Prizes prizePool={props.prizePool} />
        </div>
      )
    }
  })

  const sortOptions = [
    {
      title: t('mostDeposits'),
      key: 'deposits',
      description: t('mostPopularDescription'),
      prizePools: prizePoolsByTvl,
      isFetched: isPrizePoolsByTvlFetched,
      columnPriority: [Metrics.TVL, Metrics.PRIZES]
    },
    {
      title: t('averagePrizeSize'),
      key: 'avg_prize',
      description: t('prizesWonLastDrawExplainer2'),
      prizePools: prizePoolsByAvgPrizeValue,
      isFetched: isPrizePoolsByAvgPrizeValueFetched,
      columnPriority: [Metrics.PRIZES, Metrics.TVL]
    },
    {
      title: t('bestChanceToWin'),
      key: 'best_chances',
      description: t('bestChanceToWinDescription2'),
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
  }

  return (
    <div className={className}>
      {/* Description & Filter */}
      <div className='flex flex-col-reverse w-full sm:flex-row mb-8'>
        <div className='opacity-80 sm:max-w-lg mt-3 sm:mt-0'>{selectedSort.description}</div>
        <div className='ml-auto flex w-full sm:w-auto'>
          <div className='sm:text-lg font-semibold mr-2 whitespace-nowrap my-auto'>
            {t('sortBy')}
          </div>
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
        <span className='opacity-80'>{t('prizePool')}</span>
        {Object.keys(Columns).map((columnKey, index) => (
          <div
            key={`column-header-${index}`}
            className={classNames(
              getHiddenColumnClassNames(columnKey, selectedSort.columnPriority)
            )}
          >
            <span className='opacity-80 flex'>{Columns[columnKey].header}</span>
            {!!Columns[columnKey].tooltip && (
              <Tooltip
                id={`header-${index}`}
                iconClassName='ml-1 opacity-80'
                tip={Columns[columnKey].tooltip}
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
                <div className='text-xxs xs:text-xs font-bold'>{t('deposit')}</div>
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

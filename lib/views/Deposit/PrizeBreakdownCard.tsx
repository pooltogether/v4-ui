import { useTranslation } from 'react-i18next'
import PrizeWLaurels from 'assets/images/prize-w-laurels@2x.png'
import classnames from 'classnames'

export const PrizeBreakdownCard = (props) => {
  const { t } = useTranslation()

  return (
    <>
      <div className='bg-card rounded-lg w-full flex flex-col items-center mb-4 px-8 xs:px-20 p-10'>
        <img
          src={PrizeWLaurels}
          alt='trophy icon w/ laurels'
          height={60}
          width={88}
          className='mx-auto'
        />
        <div className='font-inter font-semibold text-sm capitalize text-accent-1 my-3'>
          {t('prizeBreakdown')}
        </div>

        <hr className='border-accent-3' style={{ width: '100%' }} />

        <div className='flex flex-col w-full'>
          <div className='flex justify-between'>
            {/* <PrizeTableHeader>{t('prize')}</PrizeTableHeader> */}
            <PrizeTableHeader widthClasses='w-1/3 xs:w-32'>{t('amount')}</PrizeTableHeader>
            <PrizeTableHeader widthClasses='w-1/3 xs:w-32'>{t('winners')}</PrizeTableHeader>
            <PrizeTableHeader widthClasses='w-24'>{t('odds')}</PrizeTableHeader>
          </div>
          <div className='flex justify-between '>
            {/* <PrizeTableCell>{t('')}</PrizeTableCell> */}
            <PrizeTableCell
              className='font-inter font-bold text-sm xs:text-lg capitalize text-accent-1 my-1 w-1/3 xs:w-32'
              isFlashy
            >
              $50,000
            </PrizeTableCell>
            <PrizeTableCell
              className='font-inter font-semibold text-sm xs:text-lg capitalize text-accent-1 my-1 w-1/3 xs:w-32'
              isFlashy
            >
              1
            </PrizeTableCell>
            <PrizeTableCell
              className='font-inter font-semibold text-sm xs:text-lg capitalize text-accent-1 my-1 w-24'
              isFlashy
            >
              1/50,000
            </PrizeTableCell>
          </div>
          <div className='flex justify-between'>
            {/* <PrizeTableCell>{t('')}</PrizeTableCell> */}
            <PrizeTableCell widthClasses='w-1/3 xs:w-32'>$2,500</PrizeTableCell>
            <PrizeTableCell widthClasses='w-1/3 xs:w-32'>10</PrizeTableCell>
            <PrizeTableCell widthClasses='w-24'>1/1,000</PrizeTableCell>
          </div>
          <div className='flex justify-between '>
            {/* <PrizeTableCell widthClasses='w-1/3 xs:w-32'>{t('')}</PrizeTableCell> */}
            <PrizeTableCell widthClasses='w-1/3 xs:w-32'>$250</PrizeTableCell>
            <PrizeTableCell widthClasses='w-1/3 xs:w-32'>100</PrizeTableCell>
            <PrizeTableCell widthClasses='w-24'>1/100</PrizeTableCell>
          </div>
        </div>
      </div>
    </>
  )
}

const PrizeTableHeader = (props) => {
  return (
    <div
      className={classnames(
        'font-inter text-xxs capitalize text-accent-1 mt-8 mb-2 opacity-60',
        props.widthClasses
      )}
    >
      {props.children}
    </div>
  )
}

const PrizeTableCell = (props) => {
  return (
    <div
      className={classnames(props.className, props.widthClasses, {
        'text-flashy': props.isFlashy
      })}
    >
      {props.children}
    </div>
  )
}

PrizeTableCell.defaultProps = {
  className: 'font-inter text-sm xs:text-lg capitalize text-accent-1 my-1 opacity-60'
}

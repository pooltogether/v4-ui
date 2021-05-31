import React from 'react'
import Link from 'next/link'
import classnames from 'classnames'

import { useTranslation } from 'react-i18next'

const addPageQueryParam = (path, pageNum) => `${path}?page=${pageNum}`

export const DefaultPaginationButtons = ({ currentPage, totalPages, baseAsPath, baseHref }) => (
  <PaginationUI
    prevPath={addPageQueryParam(baseAsPath, currentPage - 1)}
    nextPath={addPageQueryParam(baseAsPath, currentPage + 1)}
    prevPage={currentPage - 1}
    nextPage={currentPage + 1}
    currentPage={currentPage}
    currentPath={addPageQueryParam(baseAsPath, currentPage)}
    firstPath={addPageQueryParam(baseAsPath, 1)}
    lastPath={addPageQueryParam(baseAsPath, totalPages)}
    hrefPathname={baseHref}
    lastPage={totalPages}
    showFirst={currentPage > 2}
    showLast={currentPage < totalPages - 1}
    showPrev={currentPage > 1}
    showNext={totalPages > currentPage}
  />
)

export function PaginationUI(props) {
  const {
    prevPath,
    nextPath,
    currentPage,
    lastPath,
    firstPath,
    hrefPathname,
    prevPage,
    nextPage,
    lastPage,
    showFirst,
    showLast,
    showPrev,
    showNext,
    currentPath
  } = props
  const { t } = useTranslation()

  const nextPrevPageClasses =
    'no-underline rounded-lg text-green border-2 border-green hover:bg-primary text-xxxs sm:text-xxs lg:text-lg py-2 sm:py-2 px-3 sm:px-3 lg:px-5 trans whitespace-normal inline-flex sm:inline-block text-center h-10 sm:h-auto items-center justify-center leading-tight font-bold mt-2'
  const pageNumClasses =
    'inline-flex items-center justify-center no-underline text-green bg-card trans p-2 sm:p-2 rounded-lg text-sm sm:text-base mx-1 leading-none shadow-md'
  const ellipsisClasses = 'mx-1 mt-1 xs:block text-default-soft'
  const listItemClasses = 'lg:mx-2 mt-1 lg:mt-2'

  return (
    <div className={'mt-10 mb-4 flex w-full justify-between'}>
      <div className='text-left'>
        {showPrev && (
          <Link
            as={prevPath}
            href={{
              pathname: hrefPathname,
              query: {
                page: prevPage
              }
            }}
            scroll={false}
          >
            <a href={prevPath} className={nextPrevPageClasses}>
              {t('previousPage')}
            </a>
          </Link>
        )}
      </div>
      <div className='justify-center items-center text-center flex'>
        <ul className='flex justify-center items-center mx-auto'>
          {showFirst && (
            <>
              <li className={listItemClasses}>
                <Link
                  as={firstPath}
                  href={{
                    pathname: hrefPathname,
                    query: {
                      page: 1
                    }
                  }}
                  scroll={false}
                >
                  <a href={firstPath} className={pageNumClasses}>
                    1
                  </a>
                </Link>
              </li>
              <li className={ellipsisClasses}>...</li>
            </>
          )}

          {showPrev && (
            <li className={listItemClasses}>
              <Link
                as={prevPath}
                href={{
                  pathname: hrefPathname,
                  query: {
                    page: prevPage
                  }
                }}
                scroll={false}
              >
                <a href={prevPath} className={classnames(pageNumClasses, 'hidden sm:inline-flex')}>
                  {prevPage}
                </a>
              </Link>
            </li>
          )}
          <li id='current-page-num'>
            <Link
              as={currentPath}
              href={{
                pathname: hrefPathname,
                query: {
                  page: currentPage
                }
              }}
              scroll={false}
            >
              <a className={classnames(pageNumClasses, 'text-default')}>{nextPage - 1}</a>
            </Link>
          </li>
          {showNext && (
            <li className={listItemClasses}>
              <Link
                as={nextPath}
                href={{
                  pathname: hrefPathname,
                  query: {
                    page: nextPage
                  }
                }}
                scroll={false}
              >
                <a href={nextPath} className={classnames(pageNumClasses, 'hidden sm:inline-flex')}>
                  {nextPage}
                </a>
              </Link>
            </li>
          )}

          {showLast && (
            <>
              <li className={ellipsisClasses}>...</li>
              <li className={listItemClasses}>
                <Link
                  as={lastPath}
                  href={{
                    pathname: hrefPathname,
                    query: {
                      page: lastPage
                    }
                  }}
                  scroll={false}
                >
                  <a href={lastPath} className={pageNumClasses}>
                    {lastPage}
                  </a>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
      <div className='text-right'>
        {showNext && (
          <Link
            as={nextPath}
            href={{
              pathname: hrefPathname,
              query: {
                page: nextPage
              }
            }}
            scroll={false}
          >
            <a href={nextPath} className={nextPrevPageClasses}>
              {t('nextPage')}
            </a>
          </Link>
        )}
      </div>
    </div>
  )
}

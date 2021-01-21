import React from 'react'
import classnames from 'classnames'
// const navLinkClasses = 'capitalize text-center leading-none rounded-full hover:bg-accent-grey-1 flex justify-start items-center text-lg lg:text-xl py-3 px-6 lg:px-8 trans tracking-wider outline-none focus:outline-none active:outline-none font-bold'

//   return <>
//     <nav
//       className='justify-end items-center hidden sm:flex w-2/3'
//     >
//       <Link
//         href='/developers'
//         as='/developers'
//         shallow
//       >
//         {/* <div
//           className='flex items-center justify-center'
//           style={{ width: 28 }}
//         >
//         </div> */}
//         <a
//           className={classnames(
//             'mr-3',
//             navLinkClasses,
//             {
//               'text-accent-2 hover:text-highlight-2': !developersPage,
//               'text-highlight-2 hover:text-highlight-2 bg-accent-grey-1': developersPage
//             }
//           )}
//         >
//           {t('developers')}
//         </a>
//       </Link>

export const Tabs = ({ children }) => {
  return <nav className='flex items-center justify-center mb-2 mx-auto text-center'>{children}</nav>
}

export const Tab = ({ isSelected, onClick, children }) => {
  return (
    <a
      onClick={onClick}
      className={classnames(
        'cursor-pointer relative capitalize text-center leading-none rounded-full hover:bg-accent-grey-1 flex justify-start items-center text-sm xs:text-lg lg:text-xl py-2 px-6 lg:px-8 trans tracking-wider outline-none focus:outline-none active:outline-none font-bold mx-1 xs:mx-2 sm:mx-3',
        {
          'text-default hover:text-highlight-2': !isSelected,
          'selected bg-accent-grey-1 hover:bg-accent-grey-1': isSelected,
        }
      )}
    >
      {children}
    </a>
  )
}

export const Content = ({ children, className }) => {
  return <div className={classnames(className, 'py-2 flex')}>{children}</div>
}

export const ContentPane = ({ children, isSelected, alwaysPresent }) => {
  let hiddenClassName = 'hidden'
  let visibleClassName = 'flex-1'

  if (alwaysPresent) {
    hiddenClassName = 'pointer-events-none opacity-0 w-0 flex-shrink'
  }

  return (
    <div
      className={classnames({
        [hiddenClassName]: !isSelected,
        [visibleClassName]: isSelected,
      })}
    >
      {children}
    </div>
  )
}

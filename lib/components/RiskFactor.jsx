// import React from 'react'

// function range1(i) { return i ? range1(i - 1).concat(i) : [] }

// export const RiskFactor = (
//   props,
// ) => {
//   const {
//     pool
//   } = props

//   return <>
//     <div className='mt-1 uppercase text-xxxs sm:text-xxs font-bold'>Risk factor</div>
//       <div className='flex w-20 sm:w-24'
//         style={{
//           height: 27,
//           marginTop: 1,
//         }}
//       >
//         {pool.risk && range1(pool.risk).map((r, index) => {
//           const color = pool.risk >= 4 ?
//             'red' :
//             pool.risk <= 2 ?
//               'green' :
//               'yellow'
//           return <div
//             key={`${pool.poolAddress}-${index}`}
//             className={`mt-1 w-3 h-3 sm:w-4 sm:h-4 rounded-lg bg-${color} mr-1`}
//           >
//             &nbsp;
//           </div>
//         })}
//     </div>
//   </>
// }

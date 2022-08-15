import React from 'react'

import Layout from '@components/Layout'
import { AccountUI } from '@views/Account'

export default function IndexPage(props) {
  return (
    <Layout className='bg-gradient-to-br from-white via-white to-gradient-purple dark:from-gradient-purple  dark:to-pt-purple-darkest'>
      <AccountUI />
    </Layout>
  )
}

// export default function IndexPage(props) {
//   const router = useRouter()
//   const user = router.query.user as string

//   if (!!user && isAddress(user)) {
//     return (
//       <Layout>
//         <SimpleAccountUI />
//       </Layout>
//     )
//   }

//   return (
//     <Layout>
//       <AccountUI />
//     </Layout>
//   )
// }

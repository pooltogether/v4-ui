import gql from 'graphql-tag'

import { erc20BalanceFragment } from 'lib/fragments/erc20BalanceFragment'
import { erc721TokenFragment } from 'lib/fragments/erc721TokenFragment'
import { erc1155BalanceFragment } from 'lib/fragments/erc1155BalanceFragment'

export const lootBoxFragment = gql`
  fragment lootBoxFragment on LootBox {
    id
    erc721
    tokenId

    erc20Balances {
      ...erc20BalanceFragment
    }

    erc721Tokens {
      ...erc721TokenFragment
    }

    erc1155Balances {
      ...erc1155BalanceFragment
    }
  }
  ${erc20BalanceFragment}
  ${erc721TokenFragment}
  ${erc1155BalanceFragment}
`

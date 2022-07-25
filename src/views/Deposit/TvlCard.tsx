import { useAllPrizePoolTicketTwabTotalSupplies } from '@hooks/v4/PrizePool/useAllPrizePoolTicketTwabTotalSupplies'
import { BigNumber, ethers } from 'ethers'
import { useMemo } from 'react'

export const TvlCard = () => {
  const queryResults = useAllPrizePoolTicketTwabTotalSupplies()

	const isFetched = queryResults.every(queryResult => queryResult.isFetched)
	const isFetching = queryResults.every(queryResult => queryResult.isFetching)

	const tvl = useMemo(() => {
		queryResults.reduce((tvl, queryResult) => {
			if (queryResult.isFetched) {
				return tvl.add(queryResult.data.amount.)
			}
		}, ethers.constants.Zero)
	}, [isFetched, isFetching])

	if (!isFetched) {
		return <LoadingState />
	}

  return <div>
		
	</div>
}


const LoadingState = () => {
	return <div>Loading</div>
}
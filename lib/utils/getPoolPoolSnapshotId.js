import { proposalsToSnapshots } from '@pooltogether/current-pool-data'

export const getPoolPoolSnapshotId = (chainId, id) => proposalsToSnapshots[chainId]?.[id]

// import { contractAddresses } from '@pooltogether/current-pool-data'

const contractAddresses = {
  1: {
    lootBox: '0x4d695c615a7AACf2d7b9C481B66045BB2457Dfde',
    lootBoxController: '0x2c2a966b7F5448A36EC9f896088DfB99B21d8A24',
    dai: {
      prizePool: '0xEBfb47A7ad0FD6e57323C8A42B2E5A6a4F68fc1a',
      prizeStrategy: '0x178969A87a78597d303C47198c66F68E8be67Dc2'
    },
    uni: {
      prizePool: '0x0650d780292142835F6ac58dd8E2a336e87b4393',
      prizeStrategy: '0xe8726B85236a489a8E84C56c95790d07a368f913'
    },
    usdc: {
      prizePool: '0xb2153afA4b1bF7Bfd89A3C94dF5aCC13d93558f7',
      prizeStrategy: '0x1FE9ff64a57D90ABa50C39a2f89daD2c05f03Dee'
    },
  },
  4: {
    lootBox: '0xfbC6677806253dB9739d0F6CBD89b9e7Ed4A5c66',
    lootBoxController: '0xb1EAc75da9bc31B078742C5AF9EDe62EFE31299D',
    dai: {
      prizePool: '0x4706856FA8Bb747D50b4EF8547FE51Ab5Edc4Ac2',
      prizeStrategy: '0x5E0A6d336667EACE5D1b33279B50055604c3E329',
    },
    usdc: {
      prizePool: '0xde5275536231eCa2Dd506B9ccD73C028e16a9a32',
      prizeStrategy: '0x1b92BC2F339ef25161711e4EafC31999C005aF21'
    },
    usdt: {
      prizePool: '0xDCB24C5C96D3D0677add5B688DCD144601410244',
      prizeStrategy: '0x1607ce8aDe05C324043D7f5362A6d856cd4Ae589'
    },
    bat: {
      prizePool: '0xab068F220E10eEd899b54F1113dE7E354c9A8eB7',
      prizeStrategy: '0x41CF0758b7Cc2394b1C2dfF6133FEbb0Ef317C3b'
    }
  }
}

export const getContractAddresses = (chainId) => {
  let daiPoolAddress,
    batPoolAddress,
    uniPoolAddress,
    usdcPoolAddress,
    lootBox,
    lootBoxController

  batPoolAddress = contractAddresses[chainId].bat?.prizePool?.toLowerCase()
  daiPoolAddress = contractAddresses[chainId].dai?.prizePool?.toLowerCase()
  uniPoolAddress = contractAddresses[chainId].uni?.prizePool?.toLowerCase()
  usdcPoolAddress = contractAddresses[chainId].usdc?.prizePool?.toLowerCase()

  lootBox = contractAddresses[chainId].lootBox?.toLowerCase()
  lootBoxController = contractAddresses[chainId].lootBoxController?.toLowerCase()

  const pools = [
    daiPoolAddress,
    batPoolAddress,
    uniPoolAddress,
    usdcPoolAddress,
  ].filter(pool => pool !== undefined)

  return {
    pools,
    'PT-cDAI': daiPoolAddress,
    'PT-cBAT': batPoolAddress,
    'PT-cUNI': uniPoolAddress,
    'PT-cUSDC': usdcPoolAddress,
    lootBox: lootBox,
    lootBoxController: lootBoxController,
    'v2DAIPool': '0x29fe7D60DdF151E5b52e5FAB4f1325da6b2bD958'.toLowerCase(),
    'v2USDCPool': '0x0034Ea9808E620A0EF79261c51AF20614B742B24'.toLowerCase(),
    'v2DAIPod': '0x9F4C5D8d9BE360DF36E67F52aE55C1B137B4d0C4'.toLowerCase(),
    'v2USDCPod': '0x6F5587E191C8b222F634C78111F97c4851663ba4'.toLowerCase(),
    'v2PoolDAIToken': '0x49d716DFe60b37379010A75329ae09428f17118d'.toLowerCase(),
    'v2PoolUSDCToken': '0xBD87447F48ad729C5c4b8bcb503e1395F62e8B98'.toLowerCase(),
    'v2MigrationContractAddress': '0x801b4872a635dccc7e679eeaf04bef08e562972a'.toLowerCase(),
  }
}

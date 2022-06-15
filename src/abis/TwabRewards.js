export default [
  {
    inputs: [
      {
        internalType: 'contract ITicket',
        name: '_ticket',
        type: 'address'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'promotionId',
        type: 'uint256'
      }
    ],
    name: 'PromotionCreated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'promotionId',
        type: 'uint256'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256'
      }
    ],
    name: 'PromotionDestroyed',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'promotionId',
        type: 'uint256'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint8',
        name: 'epochNumber',
        type: 'uint8'
      }
    ],
    name: 'PromotionEnded',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'promotionId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'numberOfEpochs',
        type: 'uint256'
      }
    ],
    name: 'PromotionExtended',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'promotionId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint8[]',
        name: 'epochIds',
        type: 'uint8[]'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256'
      }
    ],
    name: 'RewardsClaimed',
    type: 'event'
  },
  {
    inputs: [],
    name: 'GRACE_PERIOD',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_user',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_promotionId',
        type: 'uint256'
      },
      {
        internalType: 'uint8[]',
        name: '_epochIds',
        type: 'uint8[]'
      }
    ],
    name: 'claimRewards',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'contract IERC20',
        name: '_token',
        type: 'address'
      },
      {
        internalType: 'uint64',
        name: '_startTimestamp',
        type: 'uint64'
      },
      {
        internalType: 'uint256',
        name: '_tokensPerEpoch',
        type: 'uint256'
      },
      {
        internalType: 'uint48',
        name: '_epochDuration',
        type: 'uint48'
      },
      {
        internalType: 'uint8',
        name: '_numberOfEpochs',
        type: 'uint8'
      }
    ],
    name: 'createPromotion',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_promotionId',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: '_to',
        type: 'address'
      }
    ],
    name: 'destroyPromotion',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_promotionId',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: '_to',
        type: 'address'
      }
    ],
    name: 'endPromotion',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_promotionId',
        type: 'uint256'
      },
      {
        internalType: 'uint8',
        name: '_numberOfEpochs',
        type: 'uint8'
      }
    ],
    name: 'extendPromotion',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_promotionId',
        type: 'uint256'
      }
    ],
    name: 'getCurrentEpochId',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_promotionId',
        type: 'uint256'
      }
    ],
    name: 'getPromotion',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'creator',
            type: 'address'
          },
          {
            internalType: 'uint64',
            name: 'startTimestamp',
            type: 'uint64'
          },
          {
            internalType: 'uint8',
            name: 'numberOfEpochs',
            type: 'uint8'
          },
          {
            internalType: 'uint48',
            name: 'epochDuration',
            type: 'uint48'
          },
          {
            internalType: 'uint48',
            name: 'createdAt',
            type: 'uint48'
          },
          {
            internalType: 'contract IERC20',
            name: 'token',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'tokensPerEpoch',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'rewardsUnclaimed',
            type: 'uint256'
          }
        ],
        internalType: 'struct ITwabRewards.Promotion',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_promotionId',
        type: 'uint256'
      }
    ],
    name: 'getRemainingRewards',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_user',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_promotionId',
        type: 'uint256'
      },
      {
        internalType: 'uint8[]',
        name: '_epochIds',
        type: 'uint8[]'
      }
    ],
    name: 'getRewardsAmount',
    outputs: [
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'ticket',
    outputs: [
      {
        internalType: 'contract ITicket',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]

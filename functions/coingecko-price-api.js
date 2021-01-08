// import { axiosInstance } from '../lib/axiosInstance'

// exports.handler = async (event, context, callback) => {
//   const { addressesString } = JSON.parse(event.body)

//   const url = `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${addressesString}&vs_currencies=eth%2Cusd%2Ccad`

//   try {
//     const response = await axiosInstance.get(
//       url,
//     )

//     if (response.status < 400) {
//       callback(null, {
//         statusCode: 200,
//         body: JSON.stringify(response.data)
//       })
//     } else {
//       callback(response.error)
//     }
//   } catch (e) {
//     callback(e)
//   }

// }
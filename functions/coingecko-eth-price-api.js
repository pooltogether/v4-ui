// import { axiosInstance } from '../lib/axiosInstance'

// exports.handler = async (event, context, callback) => {
//   const url = `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=cad%2Cusd&vs_currencies=usd%2Ccad`

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
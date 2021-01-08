import { axiosInstance } from '../lib/axiosInstance'

function wyreApiUrl() {
  return process.env.SENDWYRE_API_SECRET ?
    'https://api.sendwyre.com' :
    'https://api.testwyre.com'
}

async function reserveOrder(event, callback) {
  const {
    path,
    dest,
    destCurrency
  } = JSON.parse(event.body)

  const url = `${wyreApiUrl()}${path}`

  const referrerAccountId = process.env.NEXT_JS_SENDWYRE_ACCOUNT_ID || process.env.NEXT_JS_TESTWYRE_ACCOUNT_ID
  const params = {
    dest,
    destCurrency,
    referrerAccountId
  }

  const token = process.env.SENDWYRE_API_SECRET || process.env.TESTWYRE_API_SECRET
  const config = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'cache-control': 'no-cache',
      'Content-Type': 'application/json',
    }
  }

  console.log(url)
  console.log(params)
  console.log(config)

  let result
  try {
    result = await axiosInstance.post(
      url,
      params,
      config
    )
    console.log(result)

    if (result.status < 400) {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify(result.data)
      })
    } else {
      callback(result.error)
    }
  } catch (e) {
    callback(e)
  }
}

exports.handler = (event, context, callback) => {
  const { path } = JSON.parse(event.body)
  
  if (path === '/v3/orders/reserve') {
    reserveOrder(event, callback)
  }
}

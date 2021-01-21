import { axiosInstance } from '../lib/axiosInstance'

const mailChimpAPI = process.env.MAILCHIMP_API_KEY
const mcRegion = process.env.MAILCHIMP_REGION

exports.handler = async (event, context, callback) => {
  console.log(event)

  const formData = JSON.parse(event.body)
  const email = formData.email
  const listId = formData.listId
  let errorMessage = null

  if (!formData) {
    errorMessage = 'No form data supplied'
    console.log(errorMessage)
    callback(errorMessage)
  }

  if (!email) {
    errorMessage = 'No email supplied'
    console.log(errorMessage)
    callback(errorMessage)
  }

  if (!listId) {
    errorMessage = 'No listId supplied'
    console.log(errorMessage)
    callback(errorMessage)
  }

  // const data = {
  //   email_address: email,
  //   status: "subscribed",
  //   merge_fields: {}
  // }
  // const subscriber = JSON.stringify(data)
  // console.log("Sending data to mailchimp", subscriber)

  // body: subscriber
  const params = {
    email_address: email,
    status: 'subscribed',
    merge_fields: {},
  }

  const url = `https://${mcRegion}.api.mailchimp.com/3.0/lists/${listId}/members`

  const config = {
    headers: {
      'Authorization': `apikey ${mailChimpAPI}`,
      'Content-Type': 'application/json',
    },
  }

  let result
  try {
    result = await axiosInstance.post(url, params, config)
    // console.log(result.status)

    if (result.status < 400) {
      callback(null, {
        statusCode: result.status,
        body: JSON.stringify(result.data),
      })
    } else {
      callback(result.error, {
        statusCode: result.status,
        body: result.error.message,
      })
    }
  } catch (e) {
    callback(e)
  }
}

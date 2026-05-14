const axios = require('axios')

// Auto-detect environment based on key prefix
const getBaseUrl = (apiKey) => {
  if (apiKey && apiKey.startsWith('sandbox_')) {
    return 'https://sandbox-api-d.squadco.com'
  }
  return 'https://api-d.squadco.com'
}

const getDisputes = async (apiKey) => {
  const BASE_URL = getBaseUrl(apiKey)
  
  const response = await axios.get(`${BASE_URL}/dispute`, {
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  })
  return response.data
}

// Also update the other functions
const getUploadUrl = async (apiKey, ticketId, fileName) => {
  const BASE_URL = getBaseUrl(apiKey)
  const response = await axios.get(
    `${BASE_URL}/dispute/upload-url/${ticketId}/${fileName}`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  )
  return response.data
}

const resolveDispute = async (apiKey, ticketId, action, fileName) => {
  const BASE_URL = getBaseUrl(apiKey)
  const response = await axios.get(
    `${BASE_URL}/dispute/${ticketId}/resolve`,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      data: { action, file_name: fileName || null }
    }
  )
  return response.data
}

module.exports = { getDisputes, getUploadUrl, resolveDispute }
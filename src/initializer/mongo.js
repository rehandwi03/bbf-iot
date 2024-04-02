const { MongoClient, ServerApiVersion } = require('mongodb')

async function connectMongo(cfg) {
  const uri = `mongodb+srv://${cfg.MONGO_USER}:${cfg.MONGO_PASSWORD}@${cfg.MONGO_HOST}/?retryWrites=true&w=majority&appName=BBF`

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  })

  try {
    await client.connect()
    return client
  } catch (error) {
    throw error
  }
}

module.exports = connectMongo

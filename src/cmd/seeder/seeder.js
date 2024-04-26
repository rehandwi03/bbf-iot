const { MongoClient } = require('mongodb')
const Config = require('../../config/config')
const connectMongo = require('../../initializer/mongo')
const { WaterDischarge } = require('../../model/waterDischarge')

async function start() {
  const cfg = new Config()
  const mongoClient = await connectMongo(cfg)

  const col = mongoClient.db(cfg.MONGO_DB).collection('iot-data')

  for (let i = 0; i < 7; i++) {
    const now = new Date()
    now.setDate(now.getDate() + i)

    var randomNumber = Math.floor(Math.random() * 101)
    const datas = new WaterDischarge('OUT', randomNumber, 2, 'OUT_1', now)

    col.insertOne(datas)

    console.log(now)
  }
}

start()

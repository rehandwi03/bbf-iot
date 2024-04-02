class WaterDischargeUsecase {
  constructor(cfg, mongoClient) {
    this.mongoClient = mongoClient
    this.cfg = cfg
    this.find = this.find.bind(this)
  }

  find() {
    const db = this.mongoClient.db('bbf-iot')
    const collection = db.collection('iot-data')
    const docs = collection.find().toArray()

    console.log(docs)
    const res = new GetWaterDischargeRes()
    return res
  }
}

module.exports = WaterDischargeUsecase

const model = require('../model/waterDischarge')
const { plainToClass } = require('class-transformer')
const { WebSocket } = require('ws')
const { GetWaterDischargeRes } = require('../dto/waterDischarge')
const { json } = require('body-parser')

class WaterDischargeHandler {
  constructor(cfg, mqttClient, mongoClient, waterDischargeUsecase) {
    this.mqttClient = mqttClient
    this.cfg = cfg
    this.mongoClient = mongoClient
    this.sseClients = []
    this.wsClients = []
    this.waterDischargeUsecase = waterDischargeUsecase
    // this.subscribeMessage.bind(this)()
    this.eventsHandler = this.sse.bind(this)
    this.eventsHandlerWS = this.ws.bind(this)
    this.saveToDB = this.saveToDB.bind(this)
    this.summary = this.summary.bind(this)
  }

  async summary(request, response) {
    // const lastWeek = new Date()
    // const theDayOfTheLastWeek = lastWeek.getDate() + 7
    // lastWeek.setDate(theDayOfTheLastWeek)

    const startDateParams = request.query.startDate
    const endDateParams = request.query.endDate

    if (!startDateParams) {
      return response.status(400).json({ message: "startDate can't be empty" })
    }
    if (!endDateParams) {
      return response.status(400).json({ message: "endDate can't be empty" })
    }

    const startDate = new Date(startDateParams)
    const endDate = new Date(endDateParams)

    const query = {
      created_at: {
        $gt: startDate,
        $lte: endDate,
      },
    }

    const db = this.mongoClient.db('bbf-iot')
    const collection = db.collection('iot-data')
    const docs = await collection.find(query).toArray()

    // const result = []
    const promises = docs.map(async (e) => {
      const lc = db.collection('location')
      const location = await lc.findOne({ id: e.location_id })
      const res = new GetWaterDischargeRes(
        e.location_id,
        location.name,
        e.type,
        e.value,
        e.device_id,
        e.created_at,
      )

      return res
      // result.push(res)
    })

    const result = await Promise.all(promises)

    return response.json(result)
  }

  sse(request, response) {
    const headers = {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
    }
    response.writeHead(200, headers)

    this.sseClients.push(response)

    request.on('close', () => {
      this.sseClients = this.sseClients.filter((client) => client !== response)
    })
  }

  ws(ws) {
    this.wsClients.push(ws)
    ws.on('close', () => {
      this.wsClients = this.wsClients.filter((client) => client !== ws)
    })
  }

  subscribeMessage() {
    this.mqttClient.on('message', (topic, message) => {
      if (topic === this.cfg.MQTT_TOPIC) {
        const payload = JSON.parse(message.toString()) // Parse MQTT message as JSON
        console.log(payload)
        this.sendMessageToClients(payload)
        this.saveToDB(payload)
      }
    })
  }

  saveToDB(payload) {
    try {
      const datas = new model.WaterDischarge(
        payload.type,
        payload.value,
        payload.location_id,
        payload.device_id,
        new Date(),
      )

      const collection = this.mongoClient.db('bbf-iot').collection('iot-data')
      collection.insertOne(datas)
    } catch (error) {
      throw error
    }
  }

  sendMessageToClients(payload) {
    this.sseClients.forEach((r) => {
      r.write(`data: ${JSON.stringify(payload)}\n\n`) // Send MQTT data as JSON in SSE to each client
    })

    this.wsClients.forEach(async (c) => {
      const db = this.mongoClient.db('bbf-iot')
      const collection = db.collection('location')

      const query = {
        id: payload.location_id,
      }
      const location = await collection.findOne(query)

      const res = new GetWaterDischargeRes(
        payload.location_id,
        location.name ?? '',
        payload.type,
        payload.value,
        payload.device_id,
        new Date(),
      )
      if (c.readyState === WebSocket.OPEN) {
        c.send(JSON.stringify(res))
      }
    })
  }
}

module.exports = WaterDischargeHandler

const model = require('../model/waterDischarge')
const { WebSocket } = require('ws')
const { GetWaterDischargeRes } = require('../dto/waterDischarge')

class WaterDischargeHandler {
  constructor(cfg, mqttClient, mongoClient, waterDischargeUsecase) {
    this.mqttClient = mqttClient
    this.cfg = cfg
    this.mongoClient = mongoClient
    this.sseClients = []
    this.wsClients = []
    this.waterDischargeUsecase = waterDischargeUsecase
    this.eventsHandler = this.sse.bind(this)
    this.eventsHandlerWS = this.ws.bind(this)
    this.saveToDB = this.saveToDB.bind(this)
    this.summary = this.summary.bind(this)
    this.summaryWithGroup = this.summaryWithGroup.bind(this)
  }

  async summaryWithGroup(req, res) {
    const startDateParams = req.query.startDate
    const endDateParams = req.query.endDate

    if (!startDateParams) {
      return response.status(400).json({ message: "startDate can't be empty" })
    }
    if (!endDateParams) {
      return response.status(400).json({ message: "endDate can't be empty" })
    }

    const query = [
      {
        $match: {
          created_at: {
            $gte: new Date(startDateParams),
            $lte: new Date(endDateParams),
          },
        },
      },
      {
        $group: {
          _id: {
            created_at: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$created_at',
              },
            },
            type: '$type',
          },
          location_id: {
            $first: '$location_id',
          },
          device_id: {
            $first: '$device_id',
          },
          value: {
            $avg: '$value',
          },
        },
      },
      {
        $project: {
          _id: 1,
          location_id: 1,
          device_id: 1,
          value: { $round: ['$value', 0] }, // Round the average value
        },
      },
      { $sort: { _id: 1 } },
    ]

    const db = this.mongoClient.db('bbf-iot')
    const collection = db.collection('iot-data')
    const docs = await collection.aggregate(query).toArray()

    const promises = docs.map(async (e) => {
      const lc = db.collection('location')
      const location = await lc.findOne({ id: e.location_id })

      var locationName = ''
      if (location != null) {
        locationName = location.name
      }

      const r = new GetWaterDischargeRes(
        e.location_id,
        locationName,
        e._id.type,
        e.value,
        e.device_id,
        e._id.created_at,
      )

      return r
    })

    const result = await Promise.all(promises)

    return res.json(result)
  }

  async summary(request, response) {
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

    const sortCriteria = {
      created_at: 1,
    }

    const db = this.mongoClient.db('bbf-iot')
    const collection = db.collection('iot-data')
    const docs = await collection.find(query).sort(sortCriteria).toArray()

    const promises = docs.map(async (e) => {
      const lc = db.collection('location')
      const location = await lc.findOne({ id: e.location_id })

      var locationName = ''
      if (location != null) {
        locationName = location.name
      }

      const res = new GetWaterDischargeRes(
        e.location_id,
        locationName,
        e.type,
        e.value,
        e.device_id,
        e.created_at,
      )

      return res
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
    this.mqttClient.on('message', async (topic, message) => {
      if (topic === this.cfg.MQTT_TOPIC) {
        const payload = JSON.parse(message.toString())
        console.log(payload)
        this.sendMessageToClients(payload)
        await this.saveToDB(payload)
      }
    })
  }

  async saveToDB(payload) {
    try {
      const datas = new model.WaterDischarge(
        payload.type,
        payload.value,
        payload.location_id,
        payload.device_id,
        new Date(),
      )

      const collection = this.mongoClient.db('bbf-iot').collection('iot-data')
      await collection.insertOne(datas)
    } catch (error) {
      throw error
    }
  }

  sendMessageToClients(payload) {
    this.sseClients.forEach((r) => {
      r.write(`data: ${JSON.stringify(payload)}\n\n`)
    })

    this.wsClients.forEach(async (c) => {
      const db = this.mongoClient.db('bbf-iot')
      const collection = db.collection('location')

      const query = {
        id: payload.location_id,
      }
      const location = await collection.findOne(query)

      var locationName = ''
      if (location.name !== '') {
        locationName = location.name
      }

      const res = new GetWaterDischargeRes(
        payload.location_id,
        locationName,
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

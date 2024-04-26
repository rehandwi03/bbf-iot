const mqtt = require('mqtt')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const swaggerUI = require('swagger-ui-express')
const swaggerJsDoc = require('swagger-jsdoc')
const EventRoutes = require('./src/routes/rest/waterDischarge')
const connectToMongo = require('./src/initializer/mongo')
const connectToMQTT = require('./src/initializer/mqtt')
const Config = require('./src/config/config')
const WebSocket = require('ws')
const http = require('http')
const EventHandler = require('./src/handler/waterDischarge')
const WaterDischargeUsecase = require('./src/usecase/waterDischarge')

async function start() {
  try {
    const app = express()
    app.use(cors())
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }))

    const server = http.createServer(app)
    const cfg = new Config()
    const mongoClient = await connectToMongo(cfg)
    const mqttClient = await connectToMQTT(cfg)
    const wss = new WebSocket.Server({ server })

    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'API Documentation',
          version: '1.0.0',
          description: 'My API Information',
        },
      },
      apis: ['./routes/**/*.js'],
    }
    const swaggerDocs = swaggerJsDoc(swaggerOptions)
    app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs))

    const waterDischargeUsecase = new WaterDischargeUsecase(cfg, mongoClient)
    const eventHandler = new EventHandler(
      cfg,
      mqttClient,
      mongoClient,
      waterDischargeUsecase,
    )
    eventHandler.subscribeMessage()
    const eventRoutes = new EventRoutes(cfg, mqttClient, mongoClient)

    app.use('/water-discharge', eventRoutes.getRouter())

    wss.on('connection', (ws, req) => {
      const pathName = req.url
      if (pathName === '/ws') {
        eventHandler.ws(ws)
      }
    })

    mqttClient.on('connect', () => {
      console.log('connected')

      mqttClient.subscribe(cfg.MQTT_TOPIC, { qos: 0 })
    })

    mqttClient.on('offline', () => {
      console.log('Client is offline')
    })

    const PORT = 3000
    server.listen(PORT, () => {
      console.log(`Events service listening at http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Error starting server:', error)
  }
}

start()

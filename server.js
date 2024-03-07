const mqtt = require('mqtt')
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const swaggerUI = require('swagger-ui-express')
const swaggerJsDoc = require('swagger-jsdoc')
const EventRoutes = require('./src/routes/event')

const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const client = mqtt.connect('mqtt://broker.emqx.io:1883', {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'emqx',
  password: 'public',
  reconnectPeriod: 1000,
})

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'My API Information',
    },
  },
  // Path to the API docs
  apis: ['./routes/**/*.js'], // change this to the path where your route files are
}
const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs))

const eventRoutes = new EventRoutes(client)
app.use('/events', eventRoutes.getRouter())

client.on('connect', () => {
  console.log('connected')

  client.subscribe('iot', { qos: 0 })
})

client.on('offline', () => {
  console.log('Client is offline')
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Events service listening at http://localhost:${PORT}`)
})

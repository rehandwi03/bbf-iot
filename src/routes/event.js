const express = require('express')
const EventHandler = require('../handler/event')

class EventRoutes {
  constructor(mqttClient) {
    this.mqttClient = mqttClient
    this.eventHandler = new EventHandler(mqttClient)
    this.router = express.Router()

    /**
     * @swagger
     * /events:
     *   get:
     *     summary: Returns sensor data from IOT device.
     *     description: This API use Server Sent Event (SSE).
     *     responses:
     *       200:
     *         description: A sample response.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 in:
     *                   type: integer
     *                   example: 0
     *                 out:
     *                   type: integer
     *                   example: 0
     *                 date:
     *                   type: string
     *                   example: ""
     *                 id:
     *                   type: string
     *                   example: ""
     */
    this.router.get('/', this.eventHandler.eventsHandler)

    // this.subscribeMessage.bind(this)()
  }

  getRouter() {
    return this.router
  }

  // eventsHandler(request, response, next) {
  //   const headers = {
  //     'Content-Type': 'text/event-stream',
  //     Connection: 'keep-alive',
  //     'Cache-Control': 'no-cache',
  //   }
  //   response.writeHead(200, headers)

  //   this.responseData.push(response)

  //   // request.on('close', () => {
  //   //   this.responseData = this.responseData.filter(
  //   //     (client) => client.id !== clientId,
  //   //   )
  //   // })
  // }

  // subscribeMessage() {
  //   this.mqttClient.on('message', (topic, message) => {
  //     const payload = JSON.parse(message.toString()) // Parse MQTT message as JSON
  //     this.sendMessageToClients(payload)
  //   })
  // }

  // sendMessageToClients(payload) {
  //   this.responseData.forEach((r) => {
  //     r.write(`data: ${JSON.stringify(payload)}\n\n`) // Send MQTT data as JSON in SSE to each client
  //   })
  // }
}

module.exports = EventRoutes

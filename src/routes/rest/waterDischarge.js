const express = require('express')
const WatierDishchargeHandler = require('../../handler/waterDischarge')

class EventRoutes {
  constructor(cfg, mqttClient, mongoClient) {
    this.mqttClient = mqttClient
    this.waterDischargeHandler = new WatierDishchargeHandler(
      cfg,
      mqttClient,
      mongoClient,
    )
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

    this.router.get('/summary', this.waterDischargeHandler.summary.bind(this))
  }

  getRouter() {
    return this.router
  }
}

module.exports = EventRoutes

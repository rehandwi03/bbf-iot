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

    this.router.get('/summary', this.waterDischargeHandler.summary.bind(this))
    this.router.get(
      '/summary/group',
      this.waterDischargeHandler.summaryWithGroup.bind(this),
    )
  }

  getRouter() {
    return this.router
  }
}

module.exports = EventRoutes

require('dotenv').config()

class Config {
  constructor() {
    this.APP_ENV = process.env.APP_ENV
    this.MONGO_USER = process.env.MONGO_USER
    this.MONGO_PASSWORD = process.env.MONGO_PASSWORD
    this.MONGO_HOST = process.env.MONGO_HOST
    this.MONGO_DB = process.env.MONGO_DB
    this.MQTT_USER = process.env.MQTT_USER
    this.MQTT_PASSWORD = process.env.MQTT_PASSWORD
    this.MQTT_HOST = process.env.MQTT_HOST
    this.MQTT_PORT = process.env.MQTT_PORT
    this.MQTT_TOPIC = process.env.MQTT_TOPIC
  }
}

module.exports = Config

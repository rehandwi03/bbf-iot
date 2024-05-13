const { config } = require('dotenv')
const mqtt = require('mqtt')

const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

async function connectMQTT(cfg) {
  try {
    const mqttClient = mqtt.connect(
      `mqtt://${cfg.MQTT_HOST}:${cfg.MQTT_PORT}`,
      {
        clientId,
        clean: false,
        connectTimeout: 4000,
        username: `${cfg.MQTT_USER}`,
        password: `${cfg.MQTT_PASSWORD}`,
        reconnectPeriod: 1000,
        protocol: cfg.APP_ENV === 'production' ? 'mqtts' : 'mqtt',
      },
    )

    return mqttClient
  } catch (error) {
    throw error
  }
}

module.exports = connectMQTT

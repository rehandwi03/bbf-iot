class EventHandler {
  constructor(mqttClient) {
    this.mqttClient = mqttClient
    this.responseData = []
    this.subscribeMessage.bind(this)()
    this.eventsHandler = this.eventsHandler.bind(this)
  }

  eventsHandler(request, response, next) {
    const headers = {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
    }
    response.writeHead(200, headers)

    this.responseData.push(response)

    // request.on('close', () => {
    //   this.responseData = this.responseData.filter(
    //     (client) => client.id !== clientId,
    //   )
    // })
  }

  subscribeMessage() {
    this.mqttClient.on('message', (topic, message) => {
      const payload = JSON.parse(message.toString()) // Parse MQTT message as JSON
      this.sendMessageToClients(payload)
    })
  }

  sendMessageToClients(payload) {
    this.responseData.forEach((r) => {
      r.write(`data: ${JSON.stringify(payload)}\n\n`) // Send MQTT data as JSON in SSE to each client
    })
  }
}

module.exports = EventHandler

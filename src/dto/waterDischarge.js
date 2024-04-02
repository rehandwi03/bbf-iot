class GetWaterDischargeRes {
  constructor(locationId, locationName, type, value, deviceId, createdAt) {
    this.location = new Location(locationId, locationName)
    this.type = type
    this.value = value
    this.deviceId = deviceId
    this.createdAt = createdAt
  }
}

class Location {
  constructor(locationId, locationName) {
    this.id = locationId
    this.name = locationName
  }
}

module.exports = { GetWaterDischargeRes }

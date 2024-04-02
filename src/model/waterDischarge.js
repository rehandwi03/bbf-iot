class WaterDischarge {
  created_at = ''
  constructor(type, value, location_id, device_id, created_at) {
    this.type = type
    this.value = value
    this.location_id = location_id
    this.device_id = device_id
    this.created_at = created_at
  }
}

module.exports = { WaterDischarge }

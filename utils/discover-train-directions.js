'use strict'

const irishRail = require('../dist/irish-rail')

async function main () {
  const allStations = await irishRail.getStations()
  const directions = new Set()
  for (const station of allStations) {
    console.log(`Getting realtime info for ${station.name}`)
    const realTimeInfo = await irishRail.getRealTimeInfo(station.code)
    for (const info of realTimeInfo) {
      directions.add(info.direction)
    }
  }
  console.log({ directions })
}

main()

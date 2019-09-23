'use strict'

import { join } from 'path'
import { readFileSync } from 'fs'
import nock from 'nock'
import irishRail from './irish-rail'

const allStationsResponseData = readFileSync(join(__dirname, 'fixtures', 'irish-rail', 'get-all-stations.xml'))
const realTimeInfoResponseData = readFileSync(join(__dirname, 'fixtures', 'irish-rail', 'get-real-time-info.xml'))
const realTimeInfoResponseData2 = readFileSync(join(__dirname, 'fixtures', 'irish-rail', 'get-real-time-info2.xml'))

// mock get all stations request
nock('http://api.irishrail.ie')
  .get('/realtime/realtime.asmx/getAllStationsXML')
  .once()
  .reply(200, allStationsResponseData)

nock('http://api.irishrail.ie')
  .get('/realtime/realtime.asmx/getStationDataByCodeXML')
  .query({ StationCode: 'SEAPT' })
  .once()
  .reply(200, realTimeInfoResponseData)

nock('http://api.irishrail.ie')
  .get('/realtime/realtime.asmx/getStationDataByCodeXML')
  .query({ StationCode: 'ASHTN' })
  .once()
  .reply(200, realTimeInfoResponseData2)

test('It should get all stations', async function () {
  const stations = await irishRail.getStations()
  expect(stations).toMatchSnapshot()
})

test('It should get real time information for a station', async function () {
  const stationCode = 'SEAPT'
  const trains = await irishRail.getRealTimeInfo(stationCode)
  expect(trains).toMatchSnapshot()
})

test('It should get real time information for a station with a direction filter', async function () {
  const stationCode = 'ASHTN'
  const trains = await irishRail.getRealTimeInfo(stationCode, irishRail.Direction.SOUTHBOUND)
  expect(trains).toMatchSnapshot()
})

'use strict'

import { join } from 'path'
import { readFileSync } from 'fs'
import nock from 'nock'
import irishRail from './irish-rail'

const allStationsResponseData = readFileSync(join(__dirname, 'fixtures', 'irish-rail', 'get-all-stations.xml'))

// mock get all stations request
nock('http://api.irishrail.ie')
  .get('/realtime/realtime.asmx/getAllStationsXML')
  .once()
  .reply(200, allStationsResponseData)

test('It should get all stations', async function () {
  const stations = await irishRail.getStations()
  expect(stations).toMatchSnapshot()
})

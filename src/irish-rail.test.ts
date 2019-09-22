'use strict'

import { join } from 'path'
import { readFileSync } from 'fs'
import nock from 'nock'
import irishRail from './irish-rail'

const wsdlResponse = readFileSync(join(__dirname, 'fixtures', 'irish-rail', 'wsdl.xml'))
const allStationsResponseData = readFileSync(join(__dirname, 'fixtures', 'irish-rail', 'get-all-stations.xml'))

// mock WSDL request
nock('http://api.irishrail.ie')
  .get('/realtime/realtime.asmx?WSDL')
  .reply(200, wsdlResponse)

// mock get all stations request
nock('http://api.irishrail.ie', {
  reqheaders: {
    SOAPAction: '"http://api.irishrail.ie/realtime/getAllStationsXML_WithStationType"'
  }
})
  .post('/realtime/realtime.asmx')
  .once()
  .reply(200, allStationsResponseData)

test('It should get all stations', async function () {
  const stations = await irishRail.getStations()
  expect(stations).toMatchSnapshot()
})

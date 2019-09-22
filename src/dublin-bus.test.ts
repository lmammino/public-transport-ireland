'use strict'

import { join } from 'path'
import { readFileSync } from 'fs'
import nock from 'nock'
import dublinBus from './dublin-bus'

const wsdlResponse = readFileSync(join(__dirname, 'fixtures', 'dublin-bus', 'wsdl.xml'))
const allDestinationsResponseData = readFileSync(join(__dirname, 'fixtures', 'dublin-bus', 'get-all-destinations.xml'))
const realTimeInfoData = readFileSync(join(__dirname, 'fixtures', 'dublin-bus', 'get-real-time-stop-data.xml'))

// mock WSDL request
nock('http://rtpi.dublinbus.ie')
  .get('/DublinBusRTPIService.asmx?WSDL')
  .reply(200, wsdlResponse)

// mock get all destinations request
nock('http://rtpi.dublinbus.ie', {
  reqheaders: {
    SOAPAction: '"http://dublinbus.ie/GetAllDestinations"'
  }
})
  .post('/DublinBusRTPIService.asmx')
  .once()
  .reply(200, allDestinationsResponseData)

// mock get real time info request
nock('http://rtpi.dublinbus.ie', {
  reqheaders: {
    SOAPAction: '"http://dublinbus.ie/GetRealTimeStopData"'
  }
})
  .post('/DublinBusRTPIService.asmx')
  .once()
  .reply(200, realTimeInfoData)

test('It should get all stops', async function () {
  const stops = await dublinBus.getStops()
  expect(stops).toMatchSnapshot()
})

test('It should get real time information for a stop', async function () {
  const realTimeInfo = await dublinBus.getRealTimeInfo(22)
  expect(realTimeInfo).toMatchSnapshot()
})

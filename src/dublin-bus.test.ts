'use strict'

import { join } from 'path'
import { readFileSync } from 'fs'
import nock from 'nock'
import * as dublinBus from './dublin-bus'

const wsdlResponse = readFileSync(join(__dirname, 'fixtures', 'dublin-bus-wsdl.xml'))
const allDestinationsResponseData = readFileSync(join(__dirname, 'fixtures', 'dublin-bus-get-all-destinations.xml'))

nock('http://rtpi.dublinbus.ie')
  .get('/DublinBusRTPIService.asmx?WSDL')
  .reply(200, wsdlResponse)

nock('http://rtpi.dublinbus.ie', {
  reqheaders: {
    SOAPAction: '"http://dublinbus.ie/GetAllDestinations"'
  }
})
  .post('/DublinBusRTPIService.asmx')
  .once()
  .reply(200, allDestinationsResponseData)

test('It should get all stops', async function () {
  const stops = await dublinBus.getStops()
  expect(stops).toMatchSnapshot()
})

import { readFileSync } from 'fs'
import { join } from 'path'
import nock from 'nock'
import luas from './luas'

const allStopsResponseData = readFileSync(join(__dirname, 'fixtures', 'luas', 'get-all-stops.xml'))
const realTimeInfoResponseData = readFileSync(join(__dirname, 'fixtures', 'luas', 'get-real-time-info.xml'))

// mock get stops data
nock('http://luasforecasts.rpa.ie')
  .get('/xml/get.ashx')
  .query({
    action: 'list',
    ver: '2',
    encrypt: 'false'
  })
  .twice()
  .reply(200, allStopsResponseData)

nock('http://luasforecasts.rpa.ie')
  .get('/xml/get.ashx')
  .query({
    action: 'forecast',
    stop: 'DOM',
    ver: '2',
    encrypt: 'false'
  })
  .times(3)
  .reply(200, realTimeInfoResponseData)

test('It should get all stops', async function () {
  const stops = await luas.getStops()
  expect(stops).toMatchSnapshot()
})

test('It should get all stops for a line', async function () {
  const greenLineStops = await luas.getStops(luas.Line.GREEN)
  expect(greenLineStops).toMatchSnapshot()
})

test('It should get real time information for a stop', async function () {
  const realTimeInfo = await luas.getRealTimeInfo('DOM')
  expect(realTimeInfo).toMatchSnapshot()
})

test('It should get real time information for a stop filtering by a given direction', async function () {
  const inboundRealTimeInfo = await luas.getRealTimeInfo('DOM', luas.Direction.INBOUND)
  expect(inboundRealTimeInfo).toMatchSnapshot()
})

test('It should get a stop status', async function () {
  const stopStatus = await luas.getStopStatus('DOM')
  expect(stopStatus).toMatchSnapshot()
})

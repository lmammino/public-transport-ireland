import { readFileSync } from 'fs'
import { join } from 'path'
import nock from 'nock'
import luas from './luas'

const allStopsResponseData = readFileSync(join(__dirname, 'fixtures', 'luas', 'get-all-stops.xml'))

// mock get stops data
nock('http://luasforecasts.rpa.ie')
  .get('/xml/get.ashx')
  .query({
    action: 'list',
    encrypt: 'false'
  })
  .twice()
  .reply(200, allStopsResponseData)

test('It should ge all stops', async function () {
  const stops = await luas.getStops()
  expect(stops).toMatchSnapshot()
})

test('It should ge all stops for a line', async function () {
  const greenLineStops = await luas.getStops(luas.Line.GREEN)
  expect(greenLineStops).toMatchSnapshot()
})

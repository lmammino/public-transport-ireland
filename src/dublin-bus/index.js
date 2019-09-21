'use strict'

const soap = require('soap')

const WSDL_URL = 'http://rtpi.dublinbus.ie/DublinBusRTPIService.asmx?WSDL'

async function getRealTimeInfoForStop (client, stopId) {
  const [result] = await client.GetRealTimeStopDataAsync({ stopId, forceRefresh: true })
  const stopData = result.GetRealTimeStopDataResult.diffgram.DocumentElement.StopData

  const output = stopData.map(stop => `${stop.MonitoredVehicleJourney_PublishedLineName} - ${stop.MonitoredVehicleJourney_DestinationName} - ${stop.MonitoredCall_ExpectedArrivalTime}`)
  console.log(output.join('\n'))
}

async function main () {
  const client = await soap.createClientAsync(WSDL_URL)
  const stopId = Number(process.argv[2])
  getRealTimeInfoForStop(client, stopId)
}

main()

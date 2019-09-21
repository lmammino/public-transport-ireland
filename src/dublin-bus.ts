/* eslint camelcase: "off" */

import { createClientAsync } from 'soap'

const WSDL_URL = 'http://rtpi.dublinbus.ie/DublinBusRTPIService.asmx?WSDL'
const clientPromise = createClientAsync(WSDL_URL)

interface GetRealTimeStopDataOptions {
  readonly stopId: number
  readonly forceRefresh: boolean
}

interface GetRealTimeStopDataResponse {
  readonly GetRealTimeStopDataResult: {
    readonly diffgram: {
      readonly DocumentElement: {
        readonly StopData: Array<{
          MonitoredVehicleJourney_PublishedLineName: string
          MonitoredVehicleJourney_DestinationName: string
          MonitoredCall_ExpectedArrivalTime: string
        }>
      }
    }
  }
}

interface GetAllDestinationsResponse {
  readonly GetAllDestinationsResult: {
    readonly Destinations: {
      readonly Destination : Array<{
        StopNumber: number
        Longitude: number
        Latitude: number
        Description: string
      }>
    }
  }
}

interface SoapClient {
  GetRealTimeStopDataAsync (options: GetRealTimeStopDataOptions) : Promise<[GetRealTimeStopDataResponse]>
  GetAllDestinationsAsync () : Promise<[GetAllDestinationsResponse]>
}

interface RealtimeData {
  lineName: string
  destinationName: string
  expectedArrivalTime: Date
}

interface Stop {
  id: number
  longitude: number
  latitude: number
  description: string
}

/**
 * Get real time informationf or a given bus stop
 */
export async function getRealTimeInfo (stopId: number): Promise<Array<RealtimeData>> {
  const client: SoapClient = await clientPromise

  const [result] = await client.GetRealTimeStopDataAsync({ stopId, forceRefresh: true })
  const stopData = result.GetRealTimeStopDataResult.diffgram.DocumentElement.StopData

  const realTimeData = stopData.map(stop => ({
    lineName: stop.MonitoredVehicleJourney_PublishedLineName,
    destinationName: stop.MonitoredVehicleJourney_DestinationName,
    expectedArrivalTime: new Date(stop.MonitoredCall_ExpectedArrivalTime)
  }))

  return realTimeData
}

/**
 * Get information about all available stops
 */
export async function getStops () : Promise<Array<Stop>> {
  const client : SoapClient = await clientPromise

  const [result] = await client.GetAllDestinationsAsync()
  const destinationData = result.GetAllDestinationsResult.Destinations.Destination

  const stops = destinationData.map(dest => ({
    id: dest.StopNumber,
    longitude: dest.Longitude,
    latitude: dest.Latitude,
    description: dest.Description
  }))

  return stops
}

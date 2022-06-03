/* eslint camelcase: "off" */

import { DateTime } from 'luxon'
import { createClientAsync } from 'soap'

const WSDL_URL = 'http://rtpi.dublinbus.ie/DublinBusRTPIService.asmx?WSDL'
const clientPromise = createClientAsync(WSDL_URL)

export interface GetRealTimeStopDataOptions {
  readonly stopId: number
  readonly forceRefresh: boolean
}

interface GetRealTimeStopDataResponse {
  readonly GetRealTimeStopDataResult: {
    readonly diffgram: {
      readonly DocumentElement: {
        readonly StopData: Array<{
          ServiceDelivery_ResponseTimestamp: string
          MonitoredVehicleJourney_PublishedLineName: string
          MonitoredVehicleJourney_DestinationName: string
          MonitoredCall_ExpectedArrivalTime: string
          MonitoredCall_VehicleAtStop: string
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

export interface RealtimeData {
  /** The name of the bus line (e.g. "11") */
  lineName: string
  /** The name of the destination (e.g. "St Pappin's Rd via Drumcondra") */
  destinationName: string
  /** The line number and the name of the destination (e.g. "11 - St Pappin's Rd via Drumcondra") */
  destination: string
  /** A timestamp in ISO-8601 representing the expected arrival time (e.g. "2019-09-21T17:21:33.927+01:00") **/
  expectedArrivalTime: string
  /** The number of minutes for the bus to arrive at the stop (e.g. 22) */
  arrivingInMinutes: number
  /** A boolean indicating if the bus is already at the stop */
  vehicleAtStop: boolean
}

export interface Stop {
  /** The stop number (e.g. 17) */
  id: number
  /** The stop code (e.g. "17"), an alias for id (as a string) */
  code: string
  /** The longitude of the stop as float (e.g. -6.263668) */
  longitude: number
  /** The latitude of the stop as float (e.g. 53.399107) */
  latitude: number
  /** A textual description of the stop (e.g. "Ballymun Road, Nursing Home") */
  description: string
}

/**
 * Get real time information for a given bus stop
 */
export async function getRealTimeInfo (stopId: number): Promise<Array<RealtimeData>> {
  const client = await clientPromise

  const result: [GetRealTimeStopDataResponse] = await client.GetRealTimeStopDataAsync({ stopId, forceRefresh: true })
  const stopData = result[0].GetRealTimeStopDataResult.diffgram.DocumentElement.StopData

  const realTimeData : Array<RealtimeData> = stopData.map((stop) => {
    const requestTime = DateTime.fromISO(stop.ServiceDelivery_ResponseTimestamp, { zone: 'Europe/Dublin' })
    const expectedArrivalTime = DateTime.fromISO(stop.MonitoredCall_ExpectedArrivalTime, { zone: 'Europe/Dublin' })
    const arrivingInMinutes = expectedArrivalTime.diff(requestTime, 'minutes').toObject().minutes || 0
    const arrivingInMinutesApprox = Math.ceil(arrivingInMinutes)

    return {
      lineName: stop.MonitoredVehicleJourney_PublishedLineName,
      destinationName: stop.MonitoredVehicleJourney_DestinationName,
      destination: `${stop.MonitoredVehicleJourney_PublishedLineName} - ${stop.MonitoredVehicleJourney_DestinationName}`,
      expectedArrivalTime: expectedArrivalTime.toString(),
      vehicleAtStop: stop.MonitoredCall_VehicleAtStop !== 'false',
      arrivingInMinutes: arrivingInMinutesApprox
    }
  })

  return realTimeData
}

/**
 * Get information about all available stops
 */
export async function getStops () : Promise<Array<Stop>> {
  const client = await clientPromise

  const result: [GetAllDestinationsResponse] = await client.GetAllDestinationsAsync()
  const destinationData = result[0].GetAllDestinationsResult.Destinations.Destination

  const stops = destinationData.map(dest => ({
    id: dest.StopNumber,
    code: String(dest.StopNumber),
    longitude: dest.Longitude,
    latitude: dest.Latitude,
    description: dest.Description
  }))

  return stops
}

export default {
  getRealTimeInfo,
  getStops
}

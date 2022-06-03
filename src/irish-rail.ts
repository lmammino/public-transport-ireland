/* eslint no-unused-vars: "off" */

import got from 'got'
import { DateTime } from 'luxon'
import { parseXml } from './utils/parse-xml'

/**
 * An object that contains all the well known directions (key/value pairs)
 */
export enum Direction {
  NORTHBOUND = 'Northbound',
  SOUTHBOUND = 'Southbound',
  TO_BALLINA = 'To Ballina',
  TO_WESTPORT = 'To Westport',
  TO_DUBLIN_HEUSTON = 'To Dublin Heuston',
  TO_GALWAY = 'To Galway',
  TO_CORK = 'To Cork',
  TO_PORTLAOISE = 'To Portlaoise',
  TO_LIMERICK = 'To Limerick',
  TO_WATERFORD = 'To Waterford',
  TO_LIMERICK_JUNCTION = 'To Limerick Junction',
  TO_ENNIS = 'To Ennis',
  TO_MALLOW = 'To Mallow',
  TO_TRALEE = 'To Tralee',
  TO_MIDLETON = 'To Midleton',
  TO_COBH = 'To Cobh'
}

interface AllStationsResponse {
  readonly ArrayOfObjStation: {
    readonly objStation?: Array<{
      readonly StationDesc: Array<string>
      readonly StationAlias: Array<string>
      readonly StationLatitude: Array<string>
      readonly StationLongitude: Array<string>
      readonly StationCode: Array<string>
      readonly StationId: Array<string>
    }>
  }
}

interface AllTrainsResponse {
  readonly ArrayOfObjStationData: {
    readonly objStationData: Array<{
      readonly Servertime: Array<string>
      readonly Traincode: Array<string>
      readonly Stationfullname: Array<string>
      readonly Stationcode: Array<string>
      readonly Querytime: Array<string>
      readonly Traindate: Array<string>
      readonly Origin: Array<string>
      readonly Destination: Array<string>
      readonly Origintime: Array<string>
      readonly Destinationtime: Array<string>
      readonly Status: Array<string>
      readonly Lastlocation: Array<string>
      readonly Duein: Array<string>
      readonly Late: Array<string>
      readonly Exparrival: Array<string>
      readonly Expdepart: Array<string>
      readonly Scharrival: Array<string>
      readonly Schdepart: Array<string>
      readonly Direction: Array<Direction>
      readonly Traintype: Array<string>
      readonly Locationtype: Array<string>
    }>
  }
}

export interface Station {
  /** The station id (e.g. 228) */
  id: number
  /** The station code (e.g. "BFSTC") */
  code: string
  /** The station name (e.g. "Belfast") */
  name: string
  /** The station latitude (e.g. 54.6123) */
  latitude: number
  /** The station longitude (e.g. -5.91744) */
  longitude: number
}

export interface Train {
  /** The train code (e.g. "E811") */
  code: string
  /** The train origin station (e.g. "Greystones") */
  origin: string
  /** The train destination station (e.g. "Malahide") */
  destination: string
  /** The train time in ISO-8601 at its origin station (e.g. "2019-09-22T19:50:00.000+01:00") */
  originTime: string
  /** The train expected  arrival time to the final destination in ISO-8601 (e.g. "2019-09-22T21:07:00.000+01:00") */
  destinationTime: string
  /** The train status (e.g. "En Route" or "No Information") */
  status: string
  /** The minutes left before the train arrives (e.g. 23) */
  arrivingInMinutes: number
  /** The number of minutes late (e.g. 17) */
  minutesLate: number,
  /** The train expected arrival time to the station in ISO-8601 (e.g. "2019-09-22T20:36:00.000+01:00") */
  expectedArrivalTime: string,
  /** The train expected departure time from the station in ISO-8601 (e.g. "2019-09-22T20:37:00.000+01:00") */
  expectedDepartureTime: string,
  /** The train scheduled arrival time to the station in ISO-8601 (e.g. "2019-09-22T20:36:00.000+01:00") */
  scheduledArrivalTime: string,
  /** The train scheduled arrival time to the station in ISO-8601 (e.g. "2019-09-22T20:37:00.000+01:00") */
  scheduledDepartureTime: string,
  /** The train direction (e.g. "Northbound" or "Southbound") */
  direction: Direction,
  /** The type of train (e.g. "DART") */
  trainType: string
}

/**
 * Get information about all available train stations
 */
export async function getStations () : Promise<Array<Station>> {
  const response = await got('http://api.irishrail.ie/realtime/realtime.asmx/getAllStationsXML')
  const document : AllStationsResponse = await parseXml(response.body)

  const stations = document?.ArrayOfObjStation?.objStation?.map((station) => ({
    id: Number(station.StationId[0]),
    code: station.StationCode[0].trim(),
    name: station.StationDesc[0].trim(),
    longitude: Number(station.StationLongitude[0]),
    latitude: Number(station.StationLatitude[0])
  }))

  return stations || []
}

function getISOTimeForHHmm (serverTime : DateTime, time: string) : string {
  const [hours, minutes] = time.split(':').map(Number)
  const isoTime = serverTime.startOf('day').plus({ hours, minutes })

  return isoTime.toString()
}

/**
 * Get information about trains arriving at a given station
 */
export async function getRealTimeInfo (stationCode: string, direction?: Direction): Promise<Array<Train>> {
  const response = await got('http://api.irishrail.ie/realtime/realtime.asmx/getStationDataByCodeXML', {
    searchParams: {
      StationCode: stationCode
    }
  })

  const document : AllTrainsResponse = await parseXml(response.body)

  if (!document.ArrayOfObjStationData.objStationData) {
    return []
  }

  const trains = document.ArrayOfObjStationData.objStationData.map((train) => {
    const serverTime = DateTime.fromISO(train.Servertime[0].trim(), { zone: 'Europe/Dublin' })
    return {
      code: train.Traincode[0].trim(),
      origin: train.Origin[0].trim(),
      destination: train.Destination[0].trim(),
      originTime: getISOTimeForHHmm(serverTime, train.Origintime[0].trim()),
      destinationTime: getISOTimeForHHmm(serverTime, train.Destinationtime[0].trim()),
      status: train.Status[0].trim(),
      arrivingInMinutes: Number(train.Duein[0].trim()),
      minutesLate: Number(train.Late[0].trim()),
      expectedArrivalTime: getISOTimeForHHmm(serverTime, train.Exparrival[0].trim()),
      expectedDepartureTime: getISOTimeForHHmm(serverTime, train.Expdepart[0].trim()),
      scheduledArrivalTime: getISOTimeForHHmm(serverTime, train.Scharrival[0].trim()),
      scheduledDepartureTime: getISOTimeForHHmm(serverTime, train.Schdepart[0].trim()),
      direction: train.Direction[0],
      trainType: train.Traintype[0].trim()
    }
  })

  if (direction) {
    return trains.filter((train) => train.direction === direction)
  }

  return trains
}

export default {
  getStations,
  getRealTimeInfo,
  Direction
}

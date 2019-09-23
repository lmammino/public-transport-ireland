/* eslint camelcase: "off" */

import got from 'got'
import { Parser } from 'xml2js'
import { DateTime } from 'luxon'

interface AllStationsResponse {
  readonly ArrayOfObjStation: {
    readonly objStation: Array<{
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
      readonly Direction: Array<string>
      readonly Traintype: Array<string>
      readonly Locationtype: Array<string>
    }>
  }
}

interface Station {
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

interface Train {
  code: string
  origin: string
  destination: string
  originTime: string
  destinationTime: string
  status: string
  arrivingInMinutes: number
  minutesLate: number,
  expectedArrivalTime: string,
  expectedDepartureTime: string,
  scheduledArrivalTime: string,
  scheduledDepartureTime: string,
  direction: string,
  trainType: string
}

function parseXml (xmlString : string) : Promise<any> {
  return new Promise((resolve, reject) => {
    const p = new Parser()
    p.parseString(xmlString, (err : Error, result : any) => {
      if (err) {
        return reject(err)
      }

      return resolve(result)
    })
  })
}

/**
 * Get information about all available train stations
 */
export async function getStations () : Promise<Array<Station>> {
  const response = await got('http://api.irishrail.ie/realtime/realtime.asmx/getAllStationsXML')
  const document : AllStationsResponse = await parseXml(response.body)

  const stations = document.ArrayOfObjStation.objStation.map((station) => ({
    id: Number(station.StationId[0]),
    code: station.StationCode[0],
    name: station.StationDesc[0],
    longitude: Number(station.StationLongitude[0]),
    latitude: Number(station.StationLatitude[0])
  }))

  return stations
}

function getISOTimeForHHmm (serverTime : DateTime, time: string) : string {
  const [hours, minutes] = time.split(':').map(Number)
  const isoTime = serverTime.startOf('day').plus({ hours, minutes })

  return isoTime.toString()
}

/**
 * Get information about trains arriving at a given station
 */
export async function getRealTimeInfo (stationCode: string): Promise<Array<Train>> {
  const response = await got('http://api.irishrail.ie/realtime/realtime.asmx/getStationDataByCodeXML', {
    query: {
      StationCode: stationCode
    }
  })

  const document : AllTrainsResponse = await parseXml(response.body)

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
      direction: train.Direction[0].trim(),
      trainType: train.Traintype[0].trim()
    }
  })

  return trains
}

export default {
  getStations,
  getRealTimeInfo
}

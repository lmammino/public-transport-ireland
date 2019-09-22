/* eslint camelcase: "off" */

import got from 'got'
import { Parser } from 'xml2js'

interface AllStationsResponse {
  readonly ArrayOfObjStation: {
    readonly objStation: Array<{
      StationDesc: Array<string>
      StationAlias: Array<string>
      StationLatitude: Array<string>
      StationLongitude: Array<string>
      StationCode: Array<string>
      StationId: Array<string>
    }>
  }
}

interface Station {
  id?: number
  code?: string
  name?: string
  latitude?: number
  longitude?: number
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

export default {
  getStations
}

/* eslint camelcase: "off" */

import { createClientAsync } from 'soap'

const WSDL_URL = 'http://api.irishrail.ie/realtime/realtime.asmx?WSDL'
const clientPromise = createClientAsync(WSDL_URL)

interface GetAllStationsResponse {
  readonly getAllStationsXMLResult: {
    readonly objStation: Array<{
      StationDesc: string
      StationAlias: string
      StationLatitude: string
      StationLongitude: string
      StationCode: string
      StationId: string
    }>
  }
}

interface SoapClient {
  getAllStationsXMLAsync () : Promise<[GetAllStationsResponse]>
}

interface Station {
  readonly id: number
  readonly code: string
  readonly name: string
  readonly latitude: number
  readonly longitude: number
}

export async function getStations () : Promise<Array<Station>> {
  const client : SoapClient = await clientPromise
  const [resp] = await client.getAllStationsXMLAsync()
  const data = resp.getAllStationsXMLResult.objStation

  const stations = data.map(station => ({
    id: Number(station.StationId),
    code: station.StationCode,
    name: station.StationDesc,
    longitude: Number(station.StationLongitude),
    latitude: Number(station.StationLatitude)
  }))

  return stations
}

export default {
  getStations
}

/* eslint no-unused-vars: "off" */

import got from 'got'
import { parseXml } from './utils/parse-xml'

const SERVICE_URI = 'http://luasforecasts.rpa.ie/xml/get.ashx'

export enum Line {
  RED = 'Luas Red Line',
  GREEN = 'Luas Green Line'
}

interface AllStopsResponse {
  stops: {
    line: Array<{
      $: {
        name: Line // "Luas Red Line" or "Luas Green Line"
      }
      stop: Array<{
        _ : string // Stop name
        $ : {
          abrev: string
          isParkRide: string // "0" or "1"
          isCycleRide: string // "0" or "1"
          lat: string
          long: string
          pronunciation: string
          outboundStatusMessage: string
          outboundOperatingNormally: string // "True" or "False"
          outboundForecastsEnabled: string // "True" or "False"
          inboundStatusMessage: string
          inboundOperatingNormally: string // "True" or "False"
          inboundForecastsEnabled: string // "True" or "False"
        }
      }>
    }>
  }
}

interface Stop {
  /** The stop line (e.g "Luas Red Line") */
  line: Line
  /** The stop name (e.g "Saggart") */
  name: string
  /** The stop name pronunciation (e.g "Saggart") */
  pronunciation: string
  /** The stop abbreviated code (e.g "SAG") */
  code: string
  /** A boolean value indicating whether the current stop has a parking space */
  isParkRide: boolean
  /** A boolean value indicating whether the current stop has a cycle ride */
  isCycleRide: boolean
  /** The stop latitude (e.g. 53.28467885) */
  latitude: number
  /** The stop longitude (e.g. -6.43776255) */
  longitute: number
  /** Status message for outbound trains (e.g. "Services operating normally") */
  outboundStatusMessage: string
  /** boolean indicating whether outbound service is operating normally */
  outboundOperatingNormally: boolean
  /** boolean indicating whether outbound forecasts are enabled */
  outboundForecastsEnabled: boolean
  /** Status message for inbound trains (e.g. "Services operating normally") */
  inboundStatusMessage: string
  /** boolean indicating whether inbound service is operating normally */
  inboundOperatingNormally: boolean
  /** boolean indicating whether inbound forecasts are enabled */
  inboundForecastsEnabled: boolean
}

/**
 * Get all the available luas stop. Can filter by line
 */
export async function getStops (lineFilter?: Line) : Promise<Array<Stop>> {
  const response = await got(SERVICE_URI, {
    query: {
      action: 'list',
      ver: 2,
      encrypt: 'false' // yes, if you don't pass this one the response is encrypted -.-
    }
  })

  const stops : Array<Stop> = []
  const document : AllStopsResponse = await parseXml(response.body)
  document.stops.line.forEach((line) => {
    line.stop.forEach((stop) => {
      stops.push({
        line: line.$.name,
        name: stop._,
        pronunciation: stop.$.pronunciation,
        code: stop.$.abrev,
        isParkRide: stop.$.isParkRide === '1',
        isCycleRide: stop.$.isCycleRide === '1',
        latitude: Number(stop.$.lat),
        longitute: Number(stop.$.long),
        outboundStatusMessage: stop.$.outboundStatusMessage,
        outboundOperatingNormally: stop.$.outboundOperatingNormally === 'True',
        outboundForecastsEnabled: stop.$.outboundForecastsEnabled === 'True',
        inboundStatusMessage: stop.$.inboundStatusMessage,
        inboundOperatingNormally: stop.$.inboundOperatingNormally === 'True',
        inboundForecastsEnabled: stop.$.inboundForecastsEnabled === 'True'
      })
    })
  })

  if (lineFilter) {
    return stops.filter(stop => stop.line === lineFilter)
  }

  return stops
}

/**
 * get realtime information for a given stop
 */
export async function getRealTimeInfo (stop: string) {
  // TODO
  console.log(stop)
}

export default {
  getStops,
  getRealTimeInfo,
  Line
}

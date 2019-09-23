/* eslint no-unused-vars: "off" */

import got from 'got'
import { DateTime } from 'luxon'
import { parseXml } from './utils/parse-xml'

const SERVICE_URI = 'http://luasforecasts.rpa.ie/xml/get.ashx'

export enum Line {
  RED = 'Luas Red Line',
  GREEN = 'Luas Green Line'
}

export enum Direction {
  INBOUND = 'Inbound',
  OUTBOUND = 'Outbound'
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

interface StopRealTimeInfoResponse {
  stopInfo: {
    $: {
      created: string
      stop: string
      stopAbv: string
    }
    message: Array<string>
    direction: Array<{
      $: {
        name: Direction
        statusMessage: string
        forecastsEnabled: string // "True" or "False"
        operatingNormally: string // "True" or "False"
      }
      tram: Array<{
        $: {
          dueMins: string // number as string or "DUE"
          destination: string
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

interface Tram {
  /** The tram direction */
  direction: Direction,
  /** the tram destination name */
  destination: string
  /** The minutes left before the tram arrives (e.g. 23) */
  arrivingInMinutes: number
  /** The train expected arrival time to the stop in ISO-8601 (e.g. "2019-09-22T20:36:00.000+01:00") */
  expectedArrivalTime: string
}

interface StopStatus {
  /** The direction of the status message */
  direction: Direction
  /** The status message */
  statusMessage: string
  /** boolean indicating whether forecasts are enabled */
  forecastsEnabled: boolean
  /** boolean indicating whether service is operating normally */
  operatingNormally: boolean
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

  const document : AllStopsResponse = await parseXml(response.body)
  const stops : Array<Stop> = []

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
export async function getRealTimeInfo (stopCode: string, directionFilter?: Direction): Promise<Array<Tram>> {
  const response = await got(SERVICE_URI, {
    query: {
      action: 'forecast',
      stop: stopCode,
      ver: 2,
      encrypt: false
    }
  })

  const document: StopRealTimeInfoResponse = await parseXml(response.body)

  const trams : Array<Tram> = []

  const requestTime = DateTime.fromISO(document.stopInfo.$.created, { zone: 'Europe/Dublin' })

  document.stopInfo.direction.forEach((direction) => {
    direction.tram.forEach((tram) => {
      const dueMins = tram.$.dueMins === 'DUE' ? 0 : Number(tram.$.dueMins)
      trams.push({
        direction: direction.$.name,
        destination: tram.$.destination,
        arrivingInMinutes: dueMins,
        expectedArrivalTime: requestTime.plus({ minutes: dueMins }).toString()
      })
    })
  })

  if (directionFilter) {
    return trams.filter(tram => tram.direction === directionFilter)
  }

  return trams
}

/**
 * Get the status of a given stop
 */
export async function getStopStatus (stopCode: string): Promise<Array<StopStatus>> {
  const response = await got(SERVICE_URI, {
    query: {
      action: 'forecast',
      stop: stopCode,
      ver: 2,
      encrypt: false
    }
  })

  const document: StopRealTimeInfoResponse = await parseXml(response.body)

  return document.stopInfo.direction.map((direction) => ({
    direction: direction.$.name,
    statusMessage: direction.$.statusMessage,
    forecastsEnabled: direction.$.forecastsEnabled === 'True',
    operatingNormally: direction.$.operatingNormally === 'True'
  }))
}

export default {
  getStops,
  getRealTimeInfo,
  getStopStatus,
  Line,
  Direction
}

# public-transport-ireland

Node.js module with utility functions to get real time data for Irish public transport (Irish Rail, Luas, Dublin Bus)

[![npm version](https://badge.fury.io/js/public-transport-ireland.svg)](https://badge.fury.io/js/public-transport-ireland)
[![Build Status](https://dev.azure.com/loige/loige/_apis/build/status/lmammino.public-transport-ireland?branchName=master)](https://dev.azure.com/loige/loige/_build/latest?definitionId=2&branchName=master)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


## Install

With NPM:

```bash
npm install --save public-transport-ireland
```

Requires **Node.js v8+**


## Sample usage

This module contains several sub modules. You can globally import all submodules by doing something like this:

```javascript
const publicTransport = require('public-transport-ireland')

// access dublinBus.getStops
console.log(publicTransport.dublinBus.getStops) // function
```

However, since every sub module might allocate resources (e.g. SOAP or HTTP clients) as soon as they are imported, it is recommended to directly import the sub modules that you want to use:

```javascript
onst dublinBus = require('public-transport-ireland/dublin-bus')

// access dublinBus.getStops
console.log(dublinBus.getStops) // function
```


### Sub modules available

 - [`dublin-bus`](#-dublin-bus): `require('public-transport-ireland/dublin-bus')`
 - [`irish-rail`](#-irish-rail): `require('public-transport-ireland/irish-rail')`
 - [`luas`](#-luas): `require('public-transport-ireland/luas')`


## 🚌 Dublin Bus

Allows to get all the stops and the real time information for a stop.


### Examples

Get all the stops and then the real time information for the first stop:

```javascript
'use strict'

const { getStops, getRealTimeInfo } = require('public-transport-ireland/dublin-bus')

async function main () {
  const allStops = await getStops()
  console.log('allStops', allStops)
  const realTimeDataForFirstStop = await getRealTimeInfo(allStops[0].id)
  console.log('realTimeDataForFirstStop', realTimeDataForFirstStop)
}

main()
```

This will print:

```plain
allStops [
  {
    id: 2,
    longitude: -6.263695,
    latitude: 53.352241,
    description: 'Parnell Square, Parnell Street'
  },
  {
    id: 3,
    longitude: -6.263783,
    latitude: 53.352307,
    description: 'Parnell Square, Granby Place'
  },
  // ...
]

realTimeDataForFirstStop [
  {
    lineName: '46A',
    destinationName: 'Phoenix Pk via Donnybrook',
    expectedArrivalTime: '2019-09-22T16:59:59.000+01:00',
    vehicleAtStop: false,
    arrivingInMinutes: 5
  },
  {
    lineName: '38',
    destinationName: 'Damastown via Corduff',
    expectedArrivalTime: '2019-09-22T17:04:05.000+01:00',
    vehicleAtStop: false,
    arrivingInMinutes: 9
  },
  // ...
]
```


## 🚂 Irish Rail

Allows to get all the stations and the real time information for a station.


### Examples

Get all the available stations and then the real time information for the first station:

```javascript
'use strict'

const { getStations, getRealTimeInfo } = require('public-transport-ireland/irish-rail')

async function main () {
  const allStations = await getStations()
  console.log('allStations', allStations)
  const realTimeDataForFirstStation = await getRealTimeInfo(allStations[0].code)
  console.log('realTimeDataForFirstStation', realTimeDataForFirstStation)
}

main()
```

This will print:

```plain
allStations [
  {
    id: 228,
    code: 'BFSTC',
    name: 'Belfast',
    longitude: -5.91744,
    latitude: 54.6123
  },
  {
    id: 238,
    code: 'LBURN',
    name: 'Lisburn',
    longitude: -6.04327,
    latitude: 54.514
  },
  // ...
]
realTimeDataForFirstStation [
  {
    code: 'A122',
    origin: 'Dublin Connolly',
    destination: 'Belfast',
    originTime: '2019-09-23T07:35:00.000+01:00',
    destinationTime: '2019-09-23T09:45:00.000+01:00',
    status: 'En Route',
    arrivingInMinutes: 2,
    minutesLate: 5,
    expectedArrivalTime: '2019-09-23T09:50:00.000+01:00',
    expectedDepartureTime: '2019-09-23T00:00:00.000+01:00',
    scheduledArrivalTime: '2019-09-23T09:45:00.000+01:00',
    scheduledDepartureTime: '2019-09-23T00:00:00.000+01:00',
    direction: 'Northbound',
    trainType: 'Train'
  },
  {
    code: 'A125',
    origin: 'Belfast',
    destination: 'Dublin Connolly',
    originTime: '2019-09-23T10:35:00.000+01:00',
    destinationTime: '2019-09-23T12:40:00.000+01:00',
    status: 'No Information',
    arrivingInMinutes: 47,
    minutesLate: 0,
    expectedArrivalTime: '2019-09-23T00:00:00.000+01:00',
    expectedDepartureTime: '2019-09-23T10:35:00.000+01:00',
    scheduledArrivalTime: '2019-09-23T00:00:00.000+01:00',
    scheduledDepartureTime: '2019-09-23T10:35:00.000+01:00',
    direction: 'Southbound',
    trainType: 'Train'
  },
  // ...
]
```

When getting real time information you can also pass an additional parameter to filter on a specific "direction" (e.g. "Southbound" or "Northbound") as in the following example:

```javascript
'use strict'

const { getRealTimeInfo, Direction } = require('public-transport-ireland/irish-rail')

async function main () {
  const realTimeDataForAshtownSouthbound = await getRealTimeInfo('ASHTN', Direction.SOUTHBOUND)
  console.log('realTimeDataForAshtownSouthbound', realTimeDataForAshtownSouthbound)
}

main()
```

This should print something like this:

```plain
realTimeDataForAshtownSouthbound [
  {
    code: 'P740',
    origin: 'Maynooth',
    destination: 'Dublin Connolly',
    originTime: '2019-09-23T10:40:00.000+01:00',
    destinationTime: '2019-09-23T11:22:00.000+01:00',
    status: 'En Route',
    arrivingInMinutes: 1,
    minutesLate: 9,
    expectedArrivalTime: '2019-09-23T11:17:00.000+01:00',
    expectedDepartureTime: '2019-09-23T11:17:00.000+01:00',
    scheduledArrivalTime: '2019-09-23T11:07:00.000+01:00',
    scheduledDepartureTime: '2019-09-23T11:08:00.000+01:00',
    direction: 'Southbound',
    trainType: 'Train'
  },
  {
    code: 'P742',
    origin: 'Maynooth',
    destination: 'Dublin Connolly',
    originTime: '2019-09-23T11:40:00.000+01:00',
    destinationTime: '2019-09-23T12:22:00.000+01:00',
    status: 'No Information',
    arrivingInMinutes: 52,
    minutesLate: 0,
    expectedArrivalTime: '2019-09-23T12:07:00.000+01:00',
    expectedDepartureTime: '2019-09-23T12:08:00.000+01:00',
    scheduledArrivalTime: '2019-09-23T12:07:00.000+01:00',
    scheduledDepartureTime: '2019-09-23T12:08:00.000+01:00',
    direction: 'Southbound',
    trainType: 'Train'
  },
  // ...
]
```

Note that you can use the `Direction` object to get a list of well known directions.


## 🚃 Luas

... TODO ...


## Contributing

Everyone is very welcome to contribute to this project. You can contribute just by submitting bugs or
suggesting improvements by [opening an issue on GitHub](https://github.com/lmammino/public-transport-ireland/issues) or [PRs](https://github.com/lmammino/public-transport-ireland/pulls).


## License

Licensed under [MIT License](LICENSE). © Luciano Mammino.

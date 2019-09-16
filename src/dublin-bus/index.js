'use strict'

const got = require('got')

const GET_ROUTES_VIA_SERVICE_URL = 'http://www.dublinbus.ie/Templates/public/RoutePlannerService/RTPIWebServiceProxy.asmx/GetRoutesViaService'

async function getAllRoutes () {
  async function getPages (from = 0, increment = 50, stops = []) {
    const response = await got.post(
      GET_ROUTES_VIA_SERVICE_URL,
      {
        json: true,
        body: {
          context: {
            Text: '',
            NumberOfItems: from,
            Filter: '',
            MinStringLength: 1
          }
        }
      }
    )

    if (response.body.d === null) {
      return stops
    }

    response.body.d.Items.forEach(stop => stops.push(stop.Value))

    if (response.body.d.EndOfItems) {
      return stops
    }

    return getPages(from + increment, increment, stops)
  }

  return getPages()
}

module.exports = {
  getAllRoutes
}

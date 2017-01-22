const request = require('request')
const cheerio = require('cheerio')
const moment = require('moment')
moment.locale('es')
const dateFormat = 'DD/MM/YYYY'

const isTargetDate = date => {
  const excludedDates = [
    '01/01/2017',
    '14/04/2017', // Good Friday
    '17/04/2017', // Easter Monday
    '01/05/2017',
    '25/12/2017',
    '26/12/2017'
  ]
  return date.weekday() <= 4 && !excludedDates.includes(date.format(dateFormat))
}

const getMonthDates = () => {
  let aMonthDates = []
  let date = moment().startOf('month')
  let currentMonth = date.month()
  while (date.month() === currentMonth) {
    if (isTargetDate(date)) {
      aMonthDates[date.format(dateFormat)] = null
    }
    date.add(1, 'days')
  }
  return aMonthDates
}

const aDates = getMonthDates()
console.log('aDates =', aDates)

module.exports = () => {
  return new Promise((resolve, reject) => {
    request.get(
      {
        method: 'GET',
        uri: process.env.EURIBOR_SOURCE_URL
      },
      function (error, response, body) {
        if (error) {
          // console.log('request error =', error)
          reject(error)
        }
        // console.log('body =', body);
        const $ = cheerio.load(body)
        // console.log($('table.listado tr').eq(1))
        const trListado = $('table.listado tr')
        if (trListado.length) {
          // we skip the first TR (it contains the headers)
          const firstValueRowTDs = trListado.eq(1).children('td')
          const date = firstValueRowTDs.eq(0).text()
          const value = firstValueRowTDs.eq(1).text()
          const euriborData = {
            date,
            value
          }
          resolve(euriborData)
        } else {
          const error = 'no data table found in body'
          // console.log(error)
          reject(error)
        }
      }
    )
  })
}

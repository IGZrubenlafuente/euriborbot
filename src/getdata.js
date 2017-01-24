const request = require('request')
const cheerio = require('cheerio')
const moment = require('moment')
moment.locale('en')
const dateFormat = 'DD/MM/YYYY'

function isTargetDate (date) {
  const excludedDates = [
    '01/01/2017',
    '14/04/2017', // Good Friday
    '17/04/2017', // Easter Monday
    '01/05/2017',
    '25/12/2017',
    '26/12/2017'
  ]
  return date.weekday() >= 1 && date.weekday() <= 5 && !excludedDates.includes(date.format(dateFormat))
}

function buildDatesObject () {
  let oMonthDates = {}
  let date = moment().startOf('month')
  let currentMonth = date.month()
  while (date.month() === currentMonth) {
    if (isTargetDate(date)) {
      oMonthDates[date.format(dateFormat)] = null
    }
    date.add(1, 'days')
  }
  return oMonthDates
}

// const oDates = buildDatesObject()
// console.log('oDates =', oDates)
// console.log('Object.keys(oDates) =', Object.keys(oDates).filter(key => oDates[key] !== null))

function fillDatesObject (oDates, trListado) {
  let R = trListado.length
  let isCurrentMonth = true
  for (let r = 1; r < R && isCurrentMonth; r++) {
    let TDs = trListado.eq(r).children('td')
    let date = TDs.eq(0).text()
    if (oDates.hasOwnProperty(date)) {
      let value = TDs.eq(1).text()
      oDates[date] = Number(value.replace(',', '.'))
    } else {
      isCurrentMonth = false
    }
  }
}

function getAverageObject (todaysValue, trListado) {
  let oDates = buildDatesObject()
  fillDatesObject(oDates, trListado)
  // fill empty dates with today's value
  let aEmptyDates = Object.keys(oDates).filter(key => oDates[key] === null)
  aEmptyDates.forEach(emptyDate => {
    oDates[emptyDate] = Number(todaysValue.replace(',', '.'))
  })
  // console.log('oDates =', oDates)
  let sum = Object.keys(oDates).reduce((sum, key) => {
    return sum + oDates[key]
  }, 0.0)
  return {
    average: (sum / Object.keys(oDates).length).toFixed(3),
    daysLeft: aEmptyDates.length
  }
}

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
          const oAverage = getAverageObject(value, trListado)
          const euriborData = Object.assign({
            date,
            value
          }, oAverage)
          // Object.assign(obj1, obj2);
          // console.log('euriborData =', euriborData)
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

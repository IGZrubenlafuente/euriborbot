const request = require('request')
const cheerio = require('cheerio')

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

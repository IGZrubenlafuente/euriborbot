const request = require('request')
const cheerio = require('cheerio')
const moment = require('moment')
moment.locale('es')
const dateFormat = 'DD/MM/YYYY'
const Twit = require('twit')
const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

const getData = () => {
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

getData()
  .then(euriborData => {
    // console.log('euriborData =', euriborData)
    const sDateToday = moment().format(dateFormat)
    // console.log('isSameDate =', sDateToday === euriborData.date)
    if (sDateToday === euriborData.date) {
      const tweetMessage = `#Euribor ${euriborData.date}: ${euriborData.value}`
      console.log('tweetMessage =', tweetMessage)
      T.post('statuses/update',
        {status: tweetMessage},
        function (error, tweetData, response) {
          if (error) {
            throw error
          }
          // console.log('post tweetData =', tweetData);
        }
      )
    } else {
      console.log(`no tweet: collected data ('${euriborData.date}') is not today's`)
    }
  })
  .catch(err => {
    console.log('err =', err)
  })


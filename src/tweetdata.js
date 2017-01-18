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

module.exports = euriborData => {
  return new Promise((resolve, reject) => {
    // console.log('euriborData =', euriborData)
    const sDateToday = moment().format(dateFormat)
    // console.log('isSameDate =', sDateToday === euriborData.date)
    if (sDateToday === euriborData.date) {
      const tweetMessage = `#Euribor ${euriborData.date}: ${euriborData.value}`
      // console.log('tweetMessage =', tweetMessage)
      T.post('statuses/update',
        {status: tweetMessage},
        function (error, tweetData, response) {
          if (error) {
            reject(error)
          }
          console.log('tweet posted! tweetData =', tweetData)
          resolve()
        }
      )
    } else {
      console.log(`no tweet: collected data ('${euriborData.date}') is not today's`)
      resolve()
    }
  })
}

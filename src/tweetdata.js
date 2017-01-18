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

const getLastTweetDate = () => {
  return new Promise((resolve, reject) => {
    T.get('statuses/user_timeline',
      {count: 1},
      function (error, tweets, response) {
        if (error) {
          reject(error)
        }
        // console.log('tweets =', tweets)
        // console.log('date =', tweets[0].text.substr(9, 10))
        let lastTweetDate = tweets[0] ? tweets[0].text.substr(9, 10) : ''
        resolve(lastTweetDate)
      }
    )
  })
}

module.exports = euriborData => {
  return new Promise((resolve, reject) => {
    // console.log('euriborData =', euriborData)
    const sDateToday = moment().format(dateFormat)
    // console.log('isSameDate =', sDateToday === euriborData.date)
    if (sDateToday === euriborData.date) {
      getLastTweetDate()
        .then(lastTweetDate => {
          if (sDateToday !== lastTweetDate) {
            const tweetMessage = `#Euribor ${euriborData.date}: ${euriborData.value}`
            // console.log('tweetMessage =', tweetMessage)
            T.post('statuses/update',
              {status: tweetMessage},
              function (error, tweetData, response) {
                if (error) {
                  reject(error)
                }
                console.log('tweet posted! tweetData.id_str =', tweetData.id_str)
                resolve()
              }
            )
          } else {
            console.log(`no tweet: today's data (${euriborData.date}) were already tweeted`)
            resolve()
          }
        })
    } else {
      console.log(`no tweet: collected data (${euriborData.date}) are not today's`)
      // we'll try again after 1 minute
      resolve({retryInterval: 1000 * 60})
    }
  })
}

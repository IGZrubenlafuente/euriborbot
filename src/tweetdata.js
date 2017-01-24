const moment = require('moment')
moment.locale('en')
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
    const oMoment = moment()
    const oMoment1218 = moment().hours(12).minutes(18)
    const sDateToday = oMoment.format(dateFormat)
    // console.log('isSameDate =', sDateToday === euriborData.date)
    if (sDateToday === euriborData.date) {
      getLastTweetDate()
        .then(lastTweetDate => {
          if (sDateToday !== lastTweetDate) {
            const sCurrentMonth = oMoment.format('MMMM')
            let tweetMessage = `#Euribor ${euriborData.date}: ${euriborData.value}`
            if (euriborData.daysLeft > 0 && euriborData.daysLeft <= 5) {
              tweetMessage += `\n${sCurrentMonth}'s estimated average: ${euriborData.average} (last thousandth may vary)`
            } else if (euriborData.daysLeft === 0) {
              tweetMessage += `\n${sCurrentMonth}'s average: ${euriborData.average}`
            }
            // console.log('tweetMessage =', tweetMessage)
            T.post('statuses/update',
              {status: tweetMessage},
              function (error, tweetData, response) {
                if (error) {
                  reject(error)
                }
                console.log(`tweet posted! tweetData.id_str = ${tweetData.id_str}: ${tweetMessage}`)
                resolve()
              }
            )
          } else {
            console.log(`no tweet: today's data (${euriborData.date}) were already tweeted`)
            // we'll try again tomorrow
            oMoment1218.add(1, 'days')
            let intervalMs = oMoment1218.diff(oMoment)
            console.log(`retry in ${(intervalMs / 1000 / 60 / 60).toFixed(1)} h`)
            resolve({retryInterval: intervalMs})
          }
        })
    } else {
      console.log(`no tweet: collected data (${euriborData.date}) are not today's`)
      // we'll try again after 1 minute by default
      let intervalMs = 1000 * 60
      if (oMoment.isBefore(oMoment1218)) {
        // we'll try again at 12:18
        intervalMs = oMoment1218.diff(oMoment)
        console.log(`retry in ${intervalMs / 1000 / 60} min`)
      }
      resolve({retryInterval: intervalMs})
    }
  })
}

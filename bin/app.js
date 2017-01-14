const request = require('request')
const cheerio = require('cheerio')
const Twit = require('twit')
const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

request.get(
  {
    method: 'GET',
    uri: process.env.EURIBOR_SOURCE_URL
  },
  function (error, response, body) {
    if (error) {
      console.log('request error =', error)
      return
    }
    // console.log('body =', body);
    const $ = cheerio.load(body)
    // console.log($('table.listado tr').eq(1))
    const date = $('table.listado tr').eq(1).children('td').eq(0).text()
    const value = $('table.listado tr').eq(1).children('td').eq(1).text()
    // console.log(date, value);
    const tweetMessage = '#Euribor ' + date + ': ' + value
    // console.log('tweetMessage =', tweetMessage);
    T.post('statuses/update',
      {status: tweetMessage},
      function (error, data, response) {
        if (error) {
          console.log('twit error =', error)
          return
        }
        // console.log('post data =', data);
      }
    )
  }
)

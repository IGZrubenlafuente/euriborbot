const getData = require('./getdata')
const tweetData = require('./tweetdata')

getData()
  .then(tweetData)
  .catch(err => {
    console.log('err =', err)
  })


const getData = require('./getdata')
const tweetData = require('./tweetdata')

const runApp = () => {
  getData()
    .then(tweetData)
    .then(result => {
      if (result && result.retryInterval) {
        setTimeout(runApp, result.retryInterval)
      }
    })
    .catch(err => {
      console.log('err =', err)
    })
}

runApp()

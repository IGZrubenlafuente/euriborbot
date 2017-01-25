'use strict'
const getData = require('./getdata')
const tweetData = require('./tweetdata')
const moment = require('moment-timezone')
const momentUtils = require('./common/momentutils')
moment.tz.setDefault(momentUtils.settings.timezone)

const runApp = () => {
  console.log('runApp', new Date().toLocaleString())
  const oMoment = moment()
  if (!momentUtils.isTargetDate(oMoment)) {
    console.log(`no need to get data: today (${oMoment.format(momentUtils.settings.dateFormat)}) is not a target day`)
    // we'll try again tomorrow
    const intervalMs = momentUtils.getIntervalUntilTomorrow(oMoment)
    console.log(`retry in ${(intervalMs / 1000 / 60 / 60).toFixed(1)} h`)
    setTimeout(runApp, intervalMs)
  } else {
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
}

runApp()

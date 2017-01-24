const moment = require('moment')
const momentSettings = require('./momentsettings.json')
// 01/01, Good Friday, Easter Monday, 01/05, 25/12, 26/12
const excludedDates = require(`./excludeddates${moment().year()}.json`)
const oMoment1218 = moment().hours(12).minutes(18)

module.exports = {
  settings: momentSettings,
  isTargetDate: oMoment => {
    moment.locale(momentSettings.locale)
    return oMoment.weekday() >= 1 && oMoment.weekday() <= 5 && !excludedDates.includes(oMoment.format(momentSettings.dateFormat))
  },
  getIntervalUntilTomorrow: oMoment => {
    return oMoment1218.add(1, 'days').diff(oMoment)
  },
  getIntervalForLaterToday: oMoment => {
    // we'll try again in 1 minute by default
    let intervalMs = 1000 * 60
    if (oMoment.isBefore(oMoment1218)) {
      // we'll try again at 12:18
      intervalMs = oMoment1218.diff(oMoment)
    }
    return intervalMs
  }
}

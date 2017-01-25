# euriborbot

Node.js bot / worker that fetches and tweets today's Euribor 12m rate.

## Node.js dependencies

* [cheerio](https://cheerio.js.org/)
* [moment](https://momentjs.com/)
* [moment-timezone](https://momentjs.com/timezone/)
* [request](https://github.com/request/request)
* [twit](https://github.com/ttezel/twit)

## Environment variables

Twitter app variables:
* CONSUMER_KEY
* CONSUMER_SECRET
* ACCESS_TOKEN
* ACCESS_TOKEN_SECRET

Euribor source page:
* EURIBOR_SOURCE_URL

Timezone (for Heroku deployments):
* TZ=Europe/Madrid

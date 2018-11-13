'use strict'

// SQLite3 client
// https://github.com/mapbox/node-sqlite3
const sqlite = require('sqlite3').verbose()

// axios HTTP client
// https://github.com/axios/axios
// create an instance using the config defaults provided by the library
const axios = require('axios').create({
  // Store API host and base URI
  baseURL: 'https://api.e-com.plus/v1/'
})
// always JSON for request with body data
;[ 'post', 'patch', 'put' ].forEach(method => {
  axios.defaults.headers[method]['Content-Type'] = 'application/json'
})

// setup database and table
const setup = dbFilename => {
  return new Promise((resolve, reject) => {
    const table = 'ecomplus_app_auth'
    const db = new sqlite.Database(dbFilename, err => {
      if (err) {
        reject(err)
      } else {
        // try to run first query creating table
        db.run('CREATE TABLE IF NOT EXISTS ' + table + ` (
          created_at                  DATETIME  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
          updated_at                  DATETIME  NOT NULL  DEFAULT CURRENT_TIMESTAMP,
          application_id              VARCHAR   NOT NULL,
          application_app_id          INTEGER   NOT NULL,
          application_title           VARCHAR   NOT NULL,
          authentication_id           VARCHAR   NOT NULL  PRIMARY KEY,
          authentication_permissions  TEXT,
          store_id                    INTEGER   NOT NULL,
          access_token                TEXT
        );`, ready)
      }
    })
    const client = { db, table, axios }

    // resolve promise with lib methods when DB is ready
    const ready = err => {
      if (!err) {
        resolve({
          getAuth: require('./lib/methods/get-auth.js')(client),
          handleCallback: require('./lib/methods/handle-callback.js')(client),
          apiRequest: require('./lib/methods/api-request.js')(client),
          refreshToken: require('./lib/methods/refresh-token.js')(client)
        })
      } else {
        reject(err)
      }
    }

    // update access tokens periodically
    require('./lib/services/update-tokens.js')(client)
  })
}

module.exports = setup

const chalk = require('chalk')
const express = require('express')
const next = require('next')

var os = require('os')
var ifaces = os.networkInterfaces()
var ip = ''

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      // console.log(ifname + ':' + alias, iface.address);
      ip = `${alias} ${iface.address}`
    } else {
      // this interface has only one ipv4 adress
      // console.log(ifname, iface.address);
      ip = iface.address
    }
    ++alias
  })
})

const port = parseInt(process.env.PORT, 10) || 3000
const env = process.env.NODE_ENV || 'development'
const dev = env !== 'production'
const app = next({
  dir: '.', // base directory where everything is, could move to src later
  dev
})

const handle = app.getRequestHandler()

let server
app
  .prepare()
  .then(async () => {
    server = express()

    // Default catch-all handler to allow Next.js to handle all other routes
    server.all('*', (req, res) => handle(req, res))

    server.listen(port, (err) => {
      if (err) {
        throw err
      }
      console.log(chalk.yellow(`> Ready on http://${ip}:${port} [${env}]`))
    })
  })
  .catch((err) => {
    console.log('An error occurred, unable to start the server')
    console.log(err)
  })

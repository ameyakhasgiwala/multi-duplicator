#!/usr/bin/env node
// vim: set ft=javascript:

var cluster = require('cluster')
var colors = require('colors')
var log = console.log.bind(console, '[Cluster]'.blue)

if (cluster.isMaster) {

  var opts = require('optimist')
      .usage('Usage: $0 [-hv] -p port -f host:port [-d host:port] [-r int]')
      .options('h',
        { alias: 'help'
        , describe: 'show usage information'
        })
      .options('v',
        { alias: 'version'
        , describe: 'show version information'
        })
      .options('p',
        { alias: 'port'
        , describe: 'port to listen on, defaults to PORT'
        , 'default': process.env['PORT']
        })
      .options('f',
        { alias: 'forward'
        , describe: 'host to forward to'
        })
      .options('d',
        { alias: 'duplicate'
        , describe: 'host to duplicate to'
        })
      .options('r',
        { alias: 'rate'
        , describe: 'rate to sample traffic'
        , 'default': 1
        })
      .check(function(argv){
        if (argv.h) throw ''

        if (argv.v) {
          console.log(duplicator.version)
          process.exit()
        }

        if (!argv.p) throw 'You must specify a port, either via the -p option or' +
          'in the PORT environment variable'

        if (!argv.f) throw 'You must specify a host to forward to with -f option'
      })
    , argv = opts.argv

  function serverInfo() {
    log("Listening on port:", argv.p)
    if (argv.f) log("Forwarding to:", argv.f)
    if (argv.d) log("Duplicating to:", argv.d)
    if (argv.r) log("Sample rate:", argv.r)
    log(Array.isArray(argv.d))
  }

  var workers = {}
  function spawn(argv) {
    var worker = cluster.fork()
    workers[worker.pid] = worker
    worker.send(argv)
    return worker
  }

  var count = require('os').cpus().length
  for (var i = 0; i < count; i++) {
    spawn(argv)
  }

  serverInfo()

  cluster.on('exit', function(worker) {
    log('worker ' + worker.pid + ' died. spawning a new process...')
    delete workers[worker.pid]
    spawn(argv)
  })

} else {

  var duplicator = require('../')
  log = console.log.bind(console, '[Worker]'.green)
  process.on('message', function(argv) {
    log('worker started with pid', process.pid)

    var server = duplicator(function(client, forward, duplicate) {
      if (argv.f) forward(argv.f)
      if (argv.d) {
        if (Array.isArray(argv.d)) {
          argv.d.forEach (function(dup) {
            log("duplicating request to", dup)
            duplicate(dup, argv.r)
          })
        }
        else {
          duplicate(argv.d, argv.r)
        }
      }
    })
    server.listen(argv.p)
  })
}




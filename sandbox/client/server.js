var bankai = require('bankai/http')
var http = require('http')
var path = require('path')

var compiler = bankai(path.join(__dirname, 'index.js'))
var server = http.createServer(function (req, res) {
  compiler(req, res, function () {
    res.statusCode = 404
    res.end('not found')
  })
})

server.listen(3030, function () {
  console.log('listening on port 3030 of feathersjs')
})
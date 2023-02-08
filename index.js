var express = require('express')
var app = express();

const fetch = require('cross-fetch');

let Parser = require('rss-parser');
let RSSparser = new Parser();

var HTMLParser = require('node-html-parser');

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {

response.send('Hello World!')
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

var express = require('express')
var app = express();

const fetch = require('cross-fetch');

let Parser = require('rss-parser');
let RSSparser = new Parser();

var HTMLParser = require('node-html-parser');

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {

fetch("https://therecord.media/feed")
  .then(res => res.text())
  .then(async body => {
  	
    const feed = await RSSparser.parseString(body);
        
    let html = "";
    feed.items.forEach(item => {
    	    
	var root = HTMLParser.parse(item.content);

	let imgsrc = root.querySelector('img').getAttribute('src');
	// console.log(imgsrc);
	  
	  html += `<h2><span style="font-size: 18px; color: #3366ff;"><a href='${item.link}' style="color:#3366ff" >${item.title}<img width="600" src="${imgsrc}"></a></span></h2><p style="margin-bottom: 1em;">${item.contentSnippet}</p>`;
    });

    response.send(html)
    //console.log(html);
    
  });
	
	
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

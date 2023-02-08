import express from 'express';
const app = express();

import fetch from 'node-fetch';
import RSSParser from 'rss-parser';
const RSSparser = new RSSParser();

import { parse } from 'node-html-parser';

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {



fetch("https://therecord.media/feed")
  .then(res => res.text())
  .then(async body => {
  	
    const feed = await RSSparser.parseString(body);
        
    let html = "";
    feed.items.forEach(item => {

	const root = parse(item.content);
	let imgsrc = root.querySelector('img').getAttribute('src');
	// console.log(imgsrc);
	  
	  html += `<h2><span style="font-size: 18px; color: #3366ff;"><a href='${item.link}' style="color:#3366ff" >${item.title}<img width="600" src="${imgsrc}"></a></span></h2><p style="margin-bottom: 1em;">${item.contentSnippet}</p>`;
    });
    html += "";
    response.send(html)
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

});

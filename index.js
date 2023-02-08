import fetch from 'node-fetch';
import RSSParser from 'rss-parser';
const RSSparser = new RSSParser();

import { parse } from 'node-html-parser';

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
    console.log(html);
    
  });

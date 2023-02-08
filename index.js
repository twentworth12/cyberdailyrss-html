const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const request = require('superagent');

// Read the Drift token from Heroku.
// Don't put the Drift token in here like I did once because that would be bad.
const DRIFT_TOKEN = process.env.BOT_API_TOKEN

// Set the Drift API endpoints so we can use them later.
const CONVERSATION_API_BASE = 'https://driftapi.com/conversations'
const CONTACT_API_BASE = 'https://driftapi.com/contacts'

// Listen for a new Drift message
app.use(bodyParser.json())
app.listen(process.env.PORT || 3000, () => console.log('drift-app-template listening on port 3000!'))
app.post('/api', (req, res) => {
  
  // Here's a list of other possible message types
  // https://devdocs.drift.com/docs/webhook-events-1
  if (req.body.type === 'new_message') {
    handleMessage(req.body.orgId, req.body.data);  
  }
  
  return res.send('ok')


// Handle a new message from Drift. 
// See https://devdocs.drift.com/docs/message-model for a list of all of the possible message types.
function handleMessage(orgId, data) {
	
  // Only look for Drift Private Notes.
  if (data.type === 'private_note') {
    const messageBody = data.body
    const conversationId = data.conversationId
    
    
    // This is the slash command your app will use. This can be anything you want. 
    if (messageBody.startsWith('/weather')) {
      console.log("Found a Drift slash command")
      return readConversation(messageBody, conversationId, orgId, ReadConversation)
    }
  }
}

// Get the entire Drift converation in case we need it
function readConversation (messageBody, conversationId, orgId, callbackFn) {
	request
	  .get(CONVERSATION_API_BASE + `${conversationId}` + "/messages/")
	  .set(`Authorization`, `bearer ${DRIFT_TOKEN}`)
	  .set('Content-Type', 'application/json')
	  .end(function (err, res) {
		callbackFn(messageBody, res.body.data, conversationId, orgId,)
	   });
}

// Callback Function
function ReadConversation(messageBody, conversationBody, conversationId, orgId) { 
    return getContactId(messageBody, conversationBody, conversationId, orgId, GetContactId);
}

// Get the contact ID from Drift. 
// See https://devdocs.drift.com/docs/contact-model for the complete Contact Model
function getContactId(messageBody, conversationBody, conversationId, orgId, callbackFn) {
  request
   .get(CONVERSATION_API_BASE + `${conversationId}`)
    .set('Content-Type', 'application/json')
    .set(`Authorization`, `bearer ${DRIFT_TOKEN}`)
   .end(function(err, res){
       callbackFn(messageBody, conversationBody, res.body.data.contactId, conversationId, orgId)
     });
}

// Callback Function
function GetContactId(messageBody, conversationBody, contactId, conversationId, orgId) { 
    return getContactEmail(messageBody, conversationBody, contactId, conversationId, orgId, GetContactEmail);
}

// Get the email address of the person we're speaking to from Drift
function getContactEmail (messageBody, conversationBody, contactId, conversationId, orgId, callbackFn) {

	request
	  .get(CONTACT_API_BASE + `${contactId}`)
	  .set(`Authorization`, `bearer ${DRIFT_TOKEN}`)
	  .set('Content-Type', 'application/json')
	  .end(function (err, res) {
	  	  
	  if (typeof res.body.data.attributes.email != 'undefined') {
	  	emailAddress = res.body.data.attributes.email
	  	}	  	
		callbackFn(messageBody, conversationBody, emailAddress, conversationId, orgId)
	  });
}

// Callback Function
function GetContactEmail(messageBody, conversationBody, emailAddress, conversationId, orgId) { 
    return doSomething(messageBody, conversationBody, emailAddress, conversationId, orgId, DoSomething)
}


// This is where your app will do something amazing, like call an API.
// You have everything you need in this function
// What will *you* build? Personally, I'd start with a cat meme generator.
// - messageBody is the original message
// - converationBody is the entire conversation.
// - emailAddress is the email address of the person you are chatting with
function doSomething(messageBody, conversationBody, emailAddress, conversationId, orgId, callbackFn) {

    // This will pretty print the Drift conservation to the console. Uncomment if you want to see it.
    // console.log("Here are the contents of the Drift conversation: " + JSON.stringify(conversationBody, null, 2))
	
    // Here's the message you want to see back to Drift. Note it can include limited HTML like <b>, <em>, and <a>.
    // Do your cool stuff and then set the driftMessage variable.
    var message = "<b>My First Drift App!</b>"
    
    // Here's the format for a simple Drift Private Note
    const driftMessage = {
    'orgId': orgId,
    'body': message,
    'type': 'private_prompt',
    }
  
  /* Here's a Drift Private Note with a single button
  const message = {
    'orgId': orgId,
    'body': driftMessage,
    'type': 'private_prompt',
    'buttons': [{
      'label': 'Send This Result',
      'value': body,
      'type': 'reply',
      'style': 'primary',
      'reaction': {
	'type': 'delete'
      }
    },]
   } */ 
    
    callbackFn(driftMessage, conversationId, orgId)
}

// Callback Function
function DoSomething(driftMessage, conversationId, orgId) {
    return postMessage(driftMessage, conversationId, orgId)
}

// Send the message to Drift.
// See https://devdocs.drift.com/docs/creating-a-message for complete documentation 
function postMessage(driftMessage, conversationId, orgId) { 

  
    // Send the Drift message. Finally!
    request
    .post(CONVERSATION_API_BASE + `/${conversationId}/messages`)
    .set('Content-Type', 'application/json')
    .set(`Authorization`, `bearer ${DRIFT_TOKEN}`)
    .send(driftMessage)
    .catch(err => console.log(err))
    return
}
})

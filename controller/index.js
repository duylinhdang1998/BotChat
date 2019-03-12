const helper = require("../helpers/handleMessage");
const configApp = require("../helpers/config");
module.exports.index = (req, res) => {
  res.send("Sever is starting !");
};
module.exports.getMessage = (req, res) => {
  let VERIFY_TOKEN = configApp.VALIDATION_TOKEN;
  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.send("403 Forbiden");
    }
  }
};
module.exports.postMessage = (req, res) => {
  let body = req.body;
  let webhook_event = "";
  // Checks this is an event from a page subscription
  if (body.object === "page") {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
      // Gets the message. entry.messaging is an array, but
      // will only ever contain one message, so we get index 0
      webhook_event = entry.messaging[0];

      let sender_psid = webhook_event.sender.id;
      if (webhook_event.message) {
        helper.handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        helper.handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
};

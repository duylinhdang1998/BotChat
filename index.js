require("dotenv").config();
const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 1137;

const APP_SECRET = process.env.MESSENGER_APP_SECRET;
const PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
const SEVER_URL = process.env.SEVER_URL;
const VALIDATION_TOKEN = process.env.MESSENGER_VALIDATION_TOKEN;
const timeout = 3000;

app.get("/", (req, res) => {
  res.send("Sever is starting !");
});
app.post("/webhook", (req, res) => {
  let body = req.body;
  let webhook_event = "";
  // Checks this is an event from a page subscription
  if (body.object === "page") {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // Gets the message. entry.messaging is an array, but
      // will only ever contain one message, so we get index 0
      webhook_event = entry.messaging[0];

      let sender_psid = webhook_event.sender.id;
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

app.get("/webhook", (req, res) => {
  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = VALIDATION_TOKEN;

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
});

const handleMessage = (sender_psid, received_message) => {
  let response;
  if (received_message.text) {
    response = {
      "text": `You sent the message: "${
        received_message.text
        }". Now send me an image`
    };
  } else if (received_message.attachments) {
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the right picture?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              }
            ],
          }]
        }
      }
    }
  }
  //thay doi text để gửi nội dung đi. Chổ này đang gán cứng
  callSendAPI(sender_psid, response);
};
const callSendAPI = (sender_psid, response, cb = null) => {
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  };
  request(
    {
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": { "access_token": PAGE_ACCESS_TOKEN },
      "method": "POST",
      "json": request_body
    },
    (err, res, body) => {
      if (!err) {
        if (cb) {
          cb();
        }
        console.log("message sent!");
      } else {
        console.error("Unable to send message:" + err);
      }
    }
  );
};
const handlePostback = (sender_psid, received_postback) => {
  let response;
  let payload = received_postback.payload;
  switch (payload) {
    case 'GET_STARTED': {
      response = askTemplate("Do you want to visit wiloke themes!!  ");
      callSendAPI(sender_psid, response);
      break;
    }
    case 'yes': {
      response = { "text": "Thanks" };
      callSendAPI(sender_psid, response);
      break;
    }
    case 'no': {
      response = { "text": "Oops, try send another image" }
      callSendAPI(sender_psid, response);
      break;
    }
    case 'GO_WILOKE': {
      response = {
        "text": "https://listgo.wiloke.com"
      }
      callSendAPI(sender_psid, response, () => {
        setTimeout(() => {
          response = {
            "attachment": {
              "type": "image",
              "payload": {
                "url": "https://i0.wp.com/listgo.wiloke.com/wp-content/uploads/2017/07/2.jpg?resize=740%2C740&ssl=1",
                "is_reusable": true
              }
            }
          }
          console.log(response)
          callSendAPI(sender_psid, response)
        }, timeout);
      });

      break;
    }
    case 'NOT_GO_WILOKE': {
      response = { "text": "OK See you again" }
      callSendAPI(sender_psid, response);
      break;
    }
  }
}
const askTemplate = text => {
  return {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "button",
        "text": text,
        "buttons": [
          {
            "type": "postback",
            "title": "Yes",
            "payload": "GO_WILOKE"
          },
          {
            "type": "postback",
            "title": "No",
            "payload": "NOT_GO_WILOKE"
          }
        ]
      }
    }
  }
}
app.listen(PORT, () => {
  console.log("Sever listening  " + PORT);
});

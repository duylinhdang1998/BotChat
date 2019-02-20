const config = require('./config');
const timeout = 3000;
const request = require("request");
module.exports.handleMessage = (sender_psid, received_message) => {
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
module.exports.handlePostback = (sender_psid, received_postback) => {
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
            "qs": { "access_token": config.PAGE_ACCESS_TOKEN },
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

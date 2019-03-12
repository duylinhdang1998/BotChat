const config = require('./config');
const timeout = 3000;
const request = require("request");
const RestClient = require('node-rest-client').Client;
const _ = require('lodash');
const validateMessage = require('./regexMessage').vaidateMessage;
module.exports.handleMessage = (sender_psid, received_message) => {
    console.log(sender_psid)
    let response;
    if (received_message.text) {
        messageWitAI(received_message.text, sender_psid)
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
        callSendAPI(sender_psid, response);
    }
};
module.exports.handlePostback = (sender_psid, received_postback) => {
    let response;
    let payload = received_postback.payload;
    switch (payload) {
        case 'GET_STARTED': {
            messageWitAI("Bắt đầu", sender_psid);
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
const messageWitAI = (fbUserMessage, senderID) => {
    let senderName = "";
    getSenderInformation(senderID, (senderInfo) => {
        console.log(senderInfo)
        senderName = senderInfo.first_name
    });
    getWitAPIData(fbUserMessage, (witData) => {
        if (witData.entities.greeting) {
            let response = { "text": `Chào bạn ${senderName}, tôi có thể giúp gì cho bạn` };
            callSendAPI(senderID, response);
            return;
        }
        if (witData.entities.song && witData.entities.hit && witData.entities.website) {
            switch (validateMessage(witData.entities.website[0].value)) {
                case "Zing.vn": {
                    let response = { "text": "Bài hát hay nhất trên Zing Mp3 là Đúng người đúng thời điểm" };
                    callSendAPI(senderID, response, () => {
                        let res = { "text": "https://www.youtube.com/watch?v=2MZ_oQOGC24" };
                        callSendAPI(senderID, res);
                    })
                    break;
                }
                case "nhaccuatui": {
                    let res = { "text": "https://www.youtube.com/watch?v=ZQAv-3iGhSU - Đời là thế thôi" }
                    callSendAPI(senderID, res);
                    break;
                }
                default: {
                    let res = { "text": " Tôi không biết " }
                    callSendAPI(senderID, res);
                    break;
                }
            }

        }
        if (_.isEmpty(witData.entities)) {
            let response = { "text": "Xin lỗi tôi không hiểu bạn đang nói cái gì" }
            callSendAPI(senderID, response);
        }
    })


}
const getSenderInformation = (senderID, cb) => {
    return request({
        url: "https://graph.facebook.com/v3.2/" + senderID,
        qs: {
            access_token: config.PAGE_ACCESS_TOKEN,
            fields: "first_name"
        },
        method: "GET"
    }, (err, response, body) => {
        if (!err) {
            return cb(JSON.parse(body))
        }
    })
}
const getWitAPIData = (fbUserMessage, cb) => {
    const client = new RestClient();
    let arguments = {
        data: { userMessage: fbUserMessage },
        headers: { "Content-Type": "application/json" }
    };
    return client.post("https://bot-demo123.herokuapp.com/v1/getEntities", arguments, (data, response) => {
        if (data.status === 'ok') {
            return cb(data.data);
        }
        return cb(null);
    })
}

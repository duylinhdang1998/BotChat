require('dotenv').config();
const APP_SECRET = process.env.MESSENGER_APP_SECRET;
const PAGE_ACCESS_TOKEN = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
const SEVER_URL = process.env.SEVER_URL;
const VALIDATION_TOKEN = process.env.MESSENGER_VALIDATION_TOKEN;
module.exports = {
    APP_SECRET,
    PAGE_ACCESS_TOKEN,
    SEVER_URL,
    VALIDATION_TOKEN
}
const express = require('express');
const router = express.Router();
const controller = require('../controller/index');
router.get('/', controller.index);
router.get('/webhook', controller.getMessage);
router.post('/webhook', controller.postMessage);

module.exports = router;
const express = require("express");
const witRouter = express.Router();
const getEntities = require("../witapi/getEntities");
witRouter.post("/getEntities", getEntities);

module.exports = witRouter;

const Wit = require("node-wit").Wit;
const witClieent = new Wit({
  accessToken: "ZAYOZJNR45M3JKRJEF36CL5RJEG3JAPB"
});
module.exports = (req, res) => {
  let message = req.body.userMessage;
  witClieent
    .message(message, {})
    .then(response => {
      res.send({ status: "ok", data: response });
    })
    .catch(err => {
      console.log(err);
      res.status(403).send({ status: "ko", message: err });
    });
};

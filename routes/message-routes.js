const Router = require("express").Router();
const sendRouter = require("./send-routes");
const messageSchema = require("../models/message-model");
const jwt = require("jsonwebtoken");

Router.use("/send", sendRouter);

const authinticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // console.log("headers: ", req.headers, authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  // console.log(token);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) res.sendStatus(401);
    else {
      req.user = user.user;
      // console.log("user123:", req.user);
      next();
    }
  });
};

Router.get("/", authinticate, (req, res) => {
  // console.log(req.user, req.user._id);
  messageSchema.find(
    { reciverID: req.user._id },
    { senderID: 0, __v: 0, isDeleted: 0 },
    (err, messages) => {
      if (err) res.json(err.message);
      else res.json(messages);
    }
  );
  // res.json("all the messages!");
});

module.exports = Router;

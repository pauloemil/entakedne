const Router = require("express").Router();
const messageSchema = require("../models/message-model");
const userSchema = require("../models/user-model");
const joi = require("joi");
const jwt = require("jsonwebtoken");

const authinticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // console.log("headers: ", req.headers, authHeader, req.body);
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  // console.log(token);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) res.sendStatus(401);
    else {
      req.user = user;
      // console.log("user123:", req.user);
      next();
    }
  });
};

Router.post("/user/:username", authinticate, (req, res) => {
  userSchema.findOne(
    { username: req.params.username },
    // { _id: 1 },
    (err, user) => {
      // console.log("-", user._id.toString(), "-");

      if (err) res.sendStatus(403);
      if (user == null) res.sendStatus(404);
      else {
        // console.log(123, user);
        const messageJoiSchema = joi.object({}).keys({
          messageBody: joi.string().trim().min(3).max(256).required(),
        });
        const { error, value } = messageJoiSchema.validate({
          messageBody: req.body.messageBody,
        });
        if (error) {
          res.json(error.details[0].message);
        } else {
          // console.log(req.user.user._id);
          messageSchema.create(
            {
              senderID: req.user.user._id,
              reciverID: user._id.toString(),
              messageBody: req.body.messageBody,
            },
            (err, message) => {
              if (err) res.json(err);
              else res.sendStatus(200);
              // console.log(err);
            }
          );
        }
      }
    }
  );
});

module.exports = Router;

const Router = require("express").Router();
const userSchema = require("../models/user-model");
const tokenSchema = require("../models/refreshTokens-model");
const jwt = require("jsonwebtoken");
const joi = require("joi");
// const multer = require("multer");
// var fs = require("fs");
// var path = require("path");
require("dotenv").config();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads");
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.fieldname + "-" + Date.now());
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: { filesize: 1024 * 1024 * 5 },
// });

Router.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  // console.log("body: ", req.body);

  tokenSchema.findOne({ token: refreshToken }, (err, token) => {
    if (err) {
      res.json(500);
    }
    if (token == null) {
      res.sendStatus(403);
    } else {
      // console.log(token);
      jwt.verify(token.token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) res.json(403);
        else {
          // console.log(user);
          res.json({ accessToken: generateAccessToken(user.user) });
        }
      });
    }
  });
});

Router.post("/login", (req, res) => {
  // console.log(req.body, req.headers);
  const loginSchema = joi.object({}).keys({
    username: joi.string().trim().min(3).max(32).required(),
    password: joi.string().trim().min(8).max(32).required(),
  });
  const username = req.body.username;
  const password = req.body.password;
  const { error, value } = loginSchema.validate({ username, password });
  if (error) {
    res.json(error.details[0].message);
  } else {
    // console.log(value);
    //   console.log(process.env.ACCESS_TOKEN_SECRET);
    userSchema.findOne({ username: username }, (err, user) => {
      //   console.log(user);
      if (err) res.send(err);
      else if (user == null) res.sendStatus(401);
      else {
        if (user.comparePassword(password, user.password)) {
          const accessToken = generateAccessToken(user);
          const refreshToken = jwt.sign(
            { user: { username: user.username, _id: user._id } },
            process.env.REFRESH_TOKEN_SECRET,
            {
              expiresIn: "7d",
            }
          );
          tokenSchema.create({ token: refreshToken }, (err) => {
            if (err) return res.sendStatus(500);
          });
          res.json({ accessToken, refreshToken });
        } else {
          res.sendStatus(401);
        }
      }
    });
  }
});

Router.post("/register", (req, res) => {
  //upload.single("image"), (req, res) => {
  console.log(req.body);
  const displayName = req.body.displayName;
  const username = req.body.username;
  const email = req.body.email;
  const image = req.body.image;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const registerSchema = joi.object({}).keys({
    displayName: joi.string().trim().min(3).max(32).required(),
    username: joi.string().trim().min(3).max(32).required(),
    email: joi.string().trim().email().required(),
    password: joi.string().trim().min(8).max(32).required(),
    confirmPassword: joi.string().trim().min(8).max(32).required(),
    image: joi.string().required().trim(),
  });
  const { error, value } = registerSchema.validate({
    displayName,
    username,
    email,
    password,
    confirmPassword,
    image,
  });
  if (error) {
    res.json(error.details[0].message);
  } else {
    if (password == confirmPassword) {
      userSchema.findOne(
        { $or: [{ username: username }, { email: email }] },
        (err, user) => {
          if (err) return res.sendStatus(500);
          if (user != null) return res.json("this user is already registered!");
          const newUser = new userSchema({
            displayName,
            username,
            email,
            image,
          });
          newUser.password = newUser.hashPassword(password);
          userSchema.create(newUser, (err, user) => {
            if (err) res.sendStatus(403);
            else {
              const accessToken = generateAccessToken(user);
              const refreshToken = jwt.sign(
                { user: { username: user.username, _id: user._id } },
                process.env.REFRESH_TOKEN_SECRET,
                {
                  expiresIn: "7d",
                }
              );
              tokenSchema.create({ token: refreshToken }, (err) => {
                if (err) return res.sendStatus(500);
              });
              res.json({ accessToken, refreshToken });
            }
          });
        }
      );
    } else {
      res.json("password & confirm password aren't match");
    }
  }
});

const generateAccessToken = (user) => {
  return jwt.sign(
    { user: { username: user.username, _id: user._id } },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

Router.post("/logout", (req, res) => {
  // console.log(req.body);
  tokenSchema.findOneAndDelete({ token: req.body.token }, (err) => {
    if (err) res.sendStatus(403);
    else {
      res.sendStatus(204);
      // console.log("done removing the fkn token");
    }
  });
});
module.exports = Router;

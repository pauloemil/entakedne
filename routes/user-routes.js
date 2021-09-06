const Router = require("express").Router();
const userSchema = require("../models/user-model");

Router.get("/:username", (req, res) => {
  // console.log(req.params.username);
  userSchema.findOne(
    { username: req.params.username },
    { displayName: 1, username: 1, image: 1 },
    (err, user) => {
      if (err) res.json(err.message);
      else if (user == null) res.sendStatus(404);
      else {
        // console.log("hello!", user);
        res.json(user);
        // console.log(user);
      }
    }
  );
});

module.exports = Router;

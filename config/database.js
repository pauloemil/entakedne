const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI, {}, (err) => {
  if (err) console.log(err);
  else console.log("Database is connected successfully!");
});

require("dotenv").config();
const express = require("express");
const app = express();
const messageRouter = require("./routes/message-routes");
const userRouter = require("./routes/user-routes");
const authRouter = require("./routes/auth-routes");
const cors = require("cors");

require("./config/database");

let CLIENT_LINKS_LIST = [];
process.env.CLIENT_LINKS.split(", ").forEach((link) =>
  CLIENT_LINKS_LIST.push(link)
);
console.log(CLIENT_LINKS_LIST);

app.use(
  cors({
    origin: CLIENT_LINKS_LIST, // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",

    credentials: true, // allow session cookie from browser to pass through
    origin: true,
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/message", messageRouter);
app.use("/user", userRouter);
app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Home!");
});
app.get("/images/:name", (req, res) => {
  res.sendFile(__dirname + "/uploads/" + req.params.name);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("http://localhost:" + PORT);
});

require("dotenv").config();
const express = require("express");
require("./sockets/socket");

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Server is up!");
});

app.listen(port, () => {
  console.log(`Express Server is running on port ${port}`);
});

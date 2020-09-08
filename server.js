const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.send("Welcome to Dev-Connector");
});

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => console.log("Server running on port 7000"));

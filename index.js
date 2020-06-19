const express = require("express");
const dotenv = require("dotenv");
const db = require("./models");
dotenv.config();
const app = express();
db.sequelize.sync();

const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hello, express server!");
});

app.get("/about", (req, res) => {
  res.send("Hello, about!");
});

app.listen(PORT, () => {
  console.log(
    PORT
      ? `Listening server: localhost:${PORT} 👌`
      : "Your server is dead... 💀"
  );
});

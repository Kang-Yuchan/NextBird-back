const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT;

const app = express();

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

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const router = require("./routes/index.js");
const { v4 } = require("uuid");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());

const requestIdMiddleware = (req, res, next) => {
  req.id = v4();
  next();
};

app.use(requestIdMiddleware);

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(router);

app.listen(PORT, () => console.log(`Server Running on PORT ${PORT}`));

const express = require("express");

const router = express.Router();

const auth = require("./auth");
const product = require("./product");
const transaction = require("./transaction");

router.use(auth, product, transaction);

module.exports = router;

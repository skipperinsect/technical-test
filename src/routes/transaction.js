const express = require("express");

const router = express.Router();
const {
  createTransaction,
  getAllTransaction,
  deleteTransaction,
  updateTransaction,
  getTransaction,
} = require("../controllers/Transaction");
const { AuthAccess } = require("../middlewares/Auth");

router.get("/transaction", AuthAccess, getAllTransaction);
router.post("/transaction", AuthAccess, createTransaction);
router.delete("/transaction/:id", AuthAccess, deleteTransaction);
router.put("/transaction/:id", AuthAccess, updateTransaction);
router.get("/transaction/:id", AuthAccess, getTransaction);

module.exports = router;

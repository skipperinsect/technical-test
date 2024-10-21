const { Transactions, TransactionProducts, Products } = require("../models");
const { ResponseFailed, ResponseSuccess } = require("../services/Response");
const { Op } = require("sequelize");
const { validateTransactionData } = require("../services/Validator");

const getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.data_user.id;

    const transaction = await Transactions.findOne({
      where: { id, userId },
      include: [
        {
          model: TransactionProducts,
          as: "products",
          include: [
            {
              model: Products,
              as: "product",
            },
          ],
        },
      ],
    });

    if (!transaction)
      return ResponseFailed(req, res, null, "Transaction not found", 404);

    return ResponseSuccess(req, res, transaction, null, 200);
  } catch (error) {
    return ResponseFailed(req, res, error, "Failed to get transaction", 500);
  }
};

const createTransaction = async (req, res) => {
  const { error } = validateTransactionData(req.body);
  if (error) return ResponseFailed(req, res, null, error.details[0].message);

  const { invoiceNo, date, customer, products } = req.body;
  const userId = req.data_user.id;

  const transaction = await Transactions.sequelize.transaction();

  try {
    const productIds = products.map((product) => product.productId);

    const existingProducts = await Products.findAll({
      where: { id: productIds, userId },
      attributes: ["id"],
    });

    const existingProductIds = existingProducts.map((product) => product.id);
    const missingProducts = productIds.filter(
      (id) => !existingProductIds.includes(id)
    );

    if (missingProducts.length > 0) {
      await transaction.rollback();
      return ResponseFailed(
        req,
        res,
        null,
        `Products with IDs ${missingProducts.join(", ")} do not exist.`,
        400
      );
    }

    const newTransaction = await Transactions.create(
      { invoiceNo, date, customer, userId },
      { transaction }
    );

    const transactionProductsPromises = products.map((product) => {
      return TransactionProducts.create(
        {
          quantity: product.quantity,
          price: product.price,
          productId: product.productId,
          transactionId: newTransaction.id,
        },
        { transaction }
      );
    });

    await Promise.all(transactionProductsPromises);
    await transaction.commit();

    return ResponseSuccess(req, res, null, "Transaction created!", 200);
  } catch (error) {
    await transaction.rollback();
    return ResponseFailed(req, res, error, "Failed to create transaction", 500);
  }
};

const getAllTransaction = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;
    const { id } = req.data_user;

    const transactions = await Transactions.findAndCountAll({
      where: {
        invoiceNo: {
          [Op.like]: `%${search}%`,
        },
        userId: id,
      },
      include: [
        {
          model: TransactionProducts,
          as: "products",
          include: [
            {
              model: Products,
              as: "product",
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [["createdAt", "DESC"]],
    });

    if (transactions.count === 0) {
      return ResponseFailed(req, res, null, "No Transactions found", 404);
    }

    const pagination = {
      totalItems: transactions.count,
      totalPages: Math.ceil(transactions.count / limit),
      currentPage: parseInt(page),
    };

    return ResponseSuccess(
      req,
      res,
      { data: transactions.rows, pagination },
      null
    );
  } catch (error) {
    return ResponseFailed(req, res, error, "Failed to fetch transactions", 500);
  }
};

const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const userId = req.data_user.id;

  try {
    const transaction = await Transactions.findOne({
      where: { id, userId },
    });

    if (!transaction)
      return ResponseFailed(req, res, null, "Transaction not found", 404);

    await Transactions.destroy({
      where: { id, userId },
    });

    return ResponseSuccess(req, res, null, "Transaction deleted successfully");
  } catch (error) {
    return ResponseFailed(req, res, error, "Failed to delete transaction", 500);
  }
};

const updateTransaction = async (req, res) => {
  const { error } = validateTransactionData(req.body);
  if (error) return ResponseFailed(req, res, null, error.details[0].message);

  const { id } = req.params;
  const { invoiceNo, date, customer, products } = req.body;
  const userId = req.data_user.id;

  const transaction = await Transactions.sequelize.transaction();

  try {
    const existingTransaction = await Transactions.findOne({
      where: { id, userId },
    });

    if (!existingTransaction) {
      return ResponseFailed(req, res, null, "Transaction not found", 404);
    }

    const productIds = products.map((product) => product.productId);

    const existingProducts = await Products.findAll({
      where: { id: productIds, userId },
      attributes: ["id"],
    });

    const existingProductIds = existingProducts.map((product) => product.id);
    const missingProducts = productIds.filter(
      (id) => !existingProductIds.includes(id)
    );

    if (missingProducts.length > 0) {
      await transaction.rollback();
      return ResponseFailed(
        req,
        res,
        null,
        `Products with IDs ${missingProducts.join(", ")} do not exist.`,
        400
      );
    }

    await TransactionProducts.destroy({
      where: { transactionId: id },
      transaction,
    });

    await Transactions.update(
      { invoiceNo, date, customer },
      { where: { id, userId } }
    );

    const transactionProductsPromises = products.map((product) => {
      return TransactionProducts.create(
        {
          quantity: product.quantity,
          price: product.price,
          productId: product.productId,
          transactionId: id,
        },
        { transaction }
      );
    });

    await Promise.all(transactionProductsPromises);
    await transaction.commit();

    return ResponseSuccess(req, res, null, "Transaction updated!", 200);
  } catch (error) {
    await transaction.rollback();
    return ResponseFailed(req, res, error, "Failed to create transaction", 500);
  }
};

module.exports = {
  createTransaction,
  getAllTransaction,
  deleteTransaction,
  updateTransaction,
  getTransaction,
};

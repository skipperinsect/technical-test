const { Products } = require("../models");
const { ResponseFailed, ResponseSuccess } = require("../services/Response");
const { Op } = require("sequelize");
const { validateProductData } = require("../services/Validator");

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.data_user.id;

    const product = await Products.findOne({
      where: { id, userId },
    });

    if (!product)
      return ResponseFailed(req, res, null, "Product not found", 404);

    return ResponseSuccess(req, res, product, null);
  } catch (error) {
    return ResponseFailed(req, res, error, "Failed to fetch products", 500);
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const offset = (page - 1) * limit;
    const { id } = req.data_user;

    const products = await Products.findAndCountAll({
      where: {
        name: {
          [Op.like]: `%${search}%`,
        },
        userId: id,
      },
      limit: parseInt(limit),
      offset,
      order: [["createdAt", "DESC"]],
    });

    if (products.count === 0) {
      return ResponseFailed(req, res, null, "No products found", 404);
    }

    const pagination = {
      totalItems: products.count,
      totalPages: Math.ceil(products.count / limit),
      currentPage: parseInt(page),
    };

    return ResponseSuccess(req, res, { data: products.rows, pagination }, null);
  } catch (error) {
    return ResponseFailed(req, res, error, "Failed to fetch products", 500);
  }
};

const createProduct = async (req, res) => {
  const { error } = validateProductData(req.body);
  if (error)
    return ResponseFailed(req, res, null, error.details[0].message, 400);

  try {
    const { name } = req.body;
    const { id } = req.data_user;

    await Products.create({ name, userId: id });
    return ResponseSuccess(req, res, null, "Product created successfully", 201);
  } catch (error) {
    return ResponseFailed(req, res, error, "Failed to create product", 500);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.data_user.id;

    const product = await Products.findOne({
      where: { id, userId },
    });

    if (!product)
      return ResponseFailed(req, res, null, "Product not found", 404);

    await product.destroy();

    return ResponseSuccess(req, res, null, "Product deleted successfully", 200);
  } catch (error) {
    return ResponseFailed(req, res, error, "Failed to delete product", 500);
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.data_user.id;

    const product = await Products.findOne({ where: { id, userId } });

    if (!product)
      return ResponseFailed(req, res, null, "Product not found", 404);

    product.name = name;
    await product.save();

    return ResponseSuccess(req, res, null, "Product updated successfully", 200);
  } catch (error) {
    return ResponseFailed(req, res, error, "Failed to update product", 500);
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  deleteProduct,
  updateProduct,
  getProduct,
};

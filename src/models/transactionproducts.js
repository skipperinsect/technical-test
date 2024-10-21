"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TransactionProducts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      TransactionProducts.belongsTo(models.Products, {
        foreignKey: "productId",
        as: "product",
      });

      TransactionProducts.belongsTo(models.Transactions, {
        foreignKey: "transactionId",
        as: "transaction",
      });
    }
  }
  TransactionProducts.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      quantity: DataTypes.INTEGER,
      price: DataTypes.INTEGER,
      productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      transactionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Transactions",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "TransactionProducts",
    }
  );
  return TransactionProducts;
};

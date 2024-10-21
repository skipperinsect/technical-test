const Joi = require("joi");

const validateUserData = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required().messages({
      "string.base": `"name" should be a type of 'text'`,
      "string.empty": `"name" cannot be an empty field`,
      "string.min": `"name" should have a minimum length of {#limit}`,
      "string.max": `"name" should have a maximum length of {#limit}`,
      "any.required": `"name" is a required field`,
    }),

    phoneNumber: Joi.string()
      .pattern(/^[0-9]+$/)
      .min(9)
      .max(14)
      .required()
      .messages({
        "string.base": `"phoneNumber" should be a type of 'text'`,
        "string.empty": `"phoneNumber" cannot be an empty field`,
        "string.pattern.base": `"phoneNumber" should only contain digits`,
        "string.min": `"phoneNumber" should have a minimum length of {#limit}`,
        "string.max": `"phoneNumber" should have a maximum length of {#limit}`,
        "any.required": `"phoneNumber" is a required field`,
      }),

    email: Joi.string().email({ minDomainSegments: 2 }).required().messages({
      "string.base": `"email" should be a type of 'text'`,
      "string.empty": `"email" cannot be an empty field`,
      "string.email": `"email" must be a valid email`,
      "any.required": `"email" is a required field`,
    }),

    password: Joi.string().min(6).required().messages({
      "string.base": `"password" should be a type of 'text'`,
      "string.empty": `"password" cannot be an empty field`,
      "string.min": `"password" should have a minimum length of {#limit}`,
      "any.required": `"password" is a required field`,
    }),
  });
  return schema.validate(data, { abortEarly: false });
};

const validateLoginData = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Email must be a valid email address.",
      "string.empty": "Email cannot be empty.",
      "any.required": "Email is required.",
    }),
    password: Joi.string().min(6).required().messages({
      "string.empty": "Password cannot be empty.",
      "string.min": "Password must be at least 6 characters long.",
      "any.required": "Password is required.",
    }),
  });

  return schema.validate(data, { abortEarly: false });
};

const validateProductData = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
  });
  return schema.validate(data);
};

const validateTransactionData = (data) => {
  const productSchema = Joi.object({
    productId: Joi.string().uuid().required(),
    quantity: Joi.number().integer().min(1).required(),
    price: Joi.number().integer().min(0).required(),
  });

  const schema = Joi.object({
    invoiceNo: Joi.string().required(),
    date: Joi.date().iso().required(),
    customer: Joi.string().required(),
    products: Joi.array().items(productSchema).min(1).required(),
  });

  return schema.validate(data);
};

module.exports = {
  validateUserData,
  validateLoginData,
  validateProductData,
  validateTransactionData,
};

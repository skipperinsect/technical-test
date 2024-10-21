const jwt = require("jsonwebtoken");
const { Users } = require("../models");
const dotenv = require("dotenv");
const { ResponseFailed } = require("../services/Response");

dotenv.config();

const handleAuthorizationError = (req, res, message, status) => {
  return ResponseFailed(req, res, null, message, status);
};

const AuthAccess = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return handleAuthorizationError(req, res, "Invalid Credentials", 401);
  }

  const [tokenType, tokenValue] = authorization.split(" ");

  if (tokenType !== "Bearer" || !tokenValue) {
    return handleAuthorizationError(req, res, "Invalid Credentials", 403);
  }

  try {
    const decoded = jwt.verify(tokenValue, process.env.ACCESS_TOKEN_SECRET);

    const user = await Users.findOne({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      return handleAuthorizationError(req, res, "Token invalid!", 401);
    }

    req.data_user = user;
    next();
  } catch (err) {
    return handleAuthorizationError(req, res, "Token invalid!", 401);
  }
};

module.exports = { AuthAccess };

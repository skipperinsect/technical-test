const { ResponseFailed, ResponseSuccess } = require("../services/Response");
const {
  validateUserData,
  validateLoginData,
} = require("../services/Validator");
const bcrypt = require("bcryptjs");
const { Users } = require("../models");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { error } = validateUserData(req.body);
  if (error) return ResponseFailed(req, res, null, error.details[0].message);

  try {
    const { name, phoneNumber, email, password } = req.body;

    const user = await Users.findOne({ where: { email } });
    if (user)
      return ResponseFailed(req, res, null, "Email has been registered!", 409);

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    await Users.create({
      name,
      email,
      phoneNumber,
      password: hashPassword,
    });

    return ResponseSuccess(req, res, null, "User registered successfully");
  } catch (error) {
    return ResponseFailed(req, res, error, "Failed to register", 500);
  }
};

const loginUser = async (req, res) => {
  const { error } = validateLoginData(req.body);
  if (error) return ResponseFailed(req, res, null, error.details[0].message);

  try {
    const { email, password } = req.body;

    const user = await Users.findOne({ where: { email } });
    if (!user)
      return ResponseFailed(req, res, null, "Invalid credentials", 401);

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return ResponseFailed(req, res, null, "Invalid credentials", 401);

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "3d" }
    );

    const expiresIn = 3 * 24 * 60 * 60 * 1000;
    const expiredDate = new Date(Date.now() + expiresIn);

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    await Users.update(
      { refreshToken: refreshToken },
      { where: { id: user.id } }
    );

    return ResponseSuccess(
      req,
      res,
      {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        email: user.email,
        accessToken,
        expiresIn: expiredDate.getTime(),
        refreshToken,
      },
      null
    );
  } catch (error) {
    return ResponseFailed(req, res, error, "Failed to login", 500);
  }
};

module.exports = { registerUser, loginUser };

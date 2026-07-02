const asyncHandler = require("../utils/asyncHandler");
const {
  registerUser,
  loginUser,
} = require("../services/auth.service");

// =====================================
// Register Controller
// =====================================
const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);

  return res.status(201).json(result);
});

// =====================================
// Login Controller
// =====================================
const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);

  return res.status(200).json(result);
});

module.exports = {
  register,
  login,
};
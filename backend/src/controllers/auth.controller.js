const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");

// ===============================
// Register User
// ===============================
const register = async (req, res) => {
  console.log("========== REGISTER API HIT ==========");

  try {
    console.log("Request Body:", req.body);

    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      console.log("Validation Failed");

      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    console.log("Validation Passed");

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    console.log("Existing User:", existingUser);

    if (existingUser) {
      console.log("User already exists");

      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    console.log("Hashing Password...");

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Password Hashed");

    // Create User
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    console.log("User Created Successfully");
    console.log(user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    console.error("REGISTER ERROR");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ===============================
// Login User
// ===============================
const login = async (req, res) => {
  console.log("========== LOGIN API HIT ==========");

  try {
    console.log("Request Body:", req.body);

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log("Validation Failed");

      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    console.log("Validation Passed");

    // Find User
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    console.log("User Found:", user);

    if (!user) {
      console.log("User Not Found");

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("Comparing Password...");

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    console.log("Password Match:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("Password Incorrect");

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("Generating JWT Token...");

    const token = generateToken(user.id);

    console.log("JWT Generated Successfully");

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  register,
  login,
};
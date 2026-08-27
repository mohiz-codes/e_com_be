const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

function createToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function userResponse(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
}

async function signup(req, res) {
  try {
    let { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    name = name.trim();
    email = email.trim().toLowerCase();

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "An account with this email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    return res.status(201).json({ token: createToken(user), user: userResponse(user) });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Unable to sign up" });
  }
}

async function login(req, res) {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.json({ token: createToken(user), user: userResponse(user) });
  } catch (error) {
    return res.status(400).json({ message: "Unable to log in" });
  }
}

async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password").lean();
    return user ? res.json(user) : res.status(404).json({ message: "User not found" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch user profile" });
  }
}

module.exports = { signup, login, me };

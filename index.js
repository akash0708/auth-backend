const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./db");
const app = express();
const port = 5000;
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const cors = require("cors");

dotenv.config();

connectDB();

app.use(express.json());

app.use(cors());

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post(
  "/api/auth/login",
  asyncHandler(async (req, res) => {
    // extract email and passowrd from request body
    const { email, password } = req.body;
    // check if any of the fields are empty
    if (!email || !password) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }
    // check if email and password are correct
    const user = await User.findOne({ email });
    // if correct, return data with token
    if (password === user.password) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      // if not correct, return error message
      res.status(400).json({ error: "Invalid email or password" });
    }
  })
);

app.post(
  "/api/auth/signup",
  asyncHandler(async (req, res) => {
    // extract name, email, and password from request body
    const { name, email, password } = req.body;
    console.log(name);

    // check if any of the fields are empty
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }
    // Check if user is already registered
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }
    // create a new user with the extracted data
    const newUser = await User.create({ name, email, password });

    // return the user data
    if (newUser) {
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      });
    } else {
      res.status(400);
      throw new Error("Failed to create user");
    }
  })
);

app.post(
  "/api/auth/glogin",
  asyncHandler(async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      console.log("creating new user");
      const newUser = await User.create({ name, email });

      if (newUser) {
        res.status(201).json({
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        });
      } else {
        res.status(400);
        throw new Error("Failed to create user");
      }
    }
  })
);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

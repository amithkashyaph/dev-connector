const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

const authRequired = require("../../middleware/auth");
const User = require("../../models/User");

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get("/", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      errors: [
        {
          msg: error.msg,
        },
      ],
    });
  }
});

// @route   POST api/auth/login
// @desc    Authenticates the user and sends back token
// @access  Public
router.post(
  "/login",
  [
    check("email", "Email is required").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log("user");

      return res.status(400).json({
        errors: errors.array(),
      });
    }

    try {
      // Check for user
      const { email, password } = req.body;
      let user = await User.findOne({ email }).select("-password");

      if (!user) {
        return res.status(400).json({
          errors: [
            {
              msg: "Invalid Credentials",
            },
          ],
        });
      }

      // Check for password match
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          errors: [
            {
              msg: "Invalid Credentials",
            },
          ],
        });
      }

      // Create a jwt
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        {
          expiresIn: 360000,
        },
        (err, token) => {
          if (err) {
            throw err;
          }
          return res.status(200).json({
            token,
          });
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({
        errors: [
          {
            msg: error.msg,
          },
        ],
      });
    }
  }
);

module.exports = router;

const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = (req, res, next) => {
  // get the token
  const token = req.header("x-auth-token");

  // Check if there is token
  if (!token) {
    return res.status(401).json({
      errors: [
        {
          msg: "You are not authorized to access this route",
        },
      ],
    });
  }

  //   verify token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    req.user = decoded.user;

    next();
  } catch (error) {
    res.status(401).json({
      errors: [
        {
          msg: "Token is Invalid",
        },
      ],
    });
  }
};

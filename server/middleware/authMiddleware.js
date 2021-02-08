
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

exports.protect = asyncHandler(async (req, res, next) => {

  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, async (err) => {
    if (err) {
      res.status(401)
      return res.json({
        message: "Token expires or invalid",
      })
    }
    else {
      req.token = token;
      next();
    }
  })
})
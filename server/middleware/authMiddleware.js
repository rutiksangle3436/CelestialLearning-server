
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const { Subscriber } = require('../models/subscriberModel')

exports.protect = asyncHandler(async (req, res, next) => {
  let token
  {
    try {
      token = req.headers.authorization.split(' ')[1]
      console.log(`tokennnnnnnnnnn ${token}`);
      jwt.verify(token, process.env.JWT_SECRET, async (err) => {
        if (err) {
          res.status(401)
          return res.json({
            message: "Token expires or invalid",
          })
        }
        else {
          res.token = token;
          next();
        }
        //const decoded = jwt.verify(token,process.env.JWT_SECRET)
        //req.token = token;
        //req.user = await Subscriber.findOne(decoded.email).select('-password')
        //next();
      })
    }
    catch (error) {
      console.error(error)
      res.status(401)
      return res.json({
        error: new Error('Invalid request'),
      })
    }
  }

  if (!token) {
    res.status(401)
    return res.json({
      error: new Error('Invalid request'),
    })
  }
})
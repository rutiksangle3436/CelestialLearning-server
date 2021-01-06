  
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const {Subscriber} = require('../models/subscriberModel')

exports.protect = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try 
    {
      token = req.headers.authorization.split(' ')[1]
      console.log(`tokennnnnnnnnnn ${token}`);
      //const decoded = jwt.verify(token,process.env.JWT_SECRET)
      req.token = token;
      //req.user = await Subscriber.findOne(decoded.email).select('-password')
      next();
    } 
    catch (error) 
    {
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
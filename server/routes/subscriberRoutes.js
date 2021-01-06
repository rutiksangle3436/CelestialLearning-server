const express = require('express')
const router = express.Router() 
const { check } = require("express-validator");
//const auth = require('../middleware/authMiddleware');
const { register, verify ,login, forgetpassword, forgetpasswordverify, updatepassword } = require('../controller/subscriberController');
const {profile ,update} = require('../controller/subscriberProfile');

router.post(
    '/register',
    [
        check("username", "username should not be empty."),
        check("email", "Please enter valid email address.").isEmail(),
        check("password", "Weak password.").isStrongPassword(),
        check("confirm-password", "password did not match")
    ],register
);

router.post(
    '/verify',
    [
        //check("token", "Token is not present."),
    ],verify 
);

router.post(
    '/forgetpasswordverify',
    [
        check("token", "Token is not present.")
    ],
    forgetpasswordverify
);
router.post(
    '/login',
    [
        check("email", "Email should not be empty.").isEmail(),
        check("password","Password field is required.")
    ], login
);

router.post(
    '/forgetpassword',
    [
        check("email","Email should not be empty.").isEmail(),
    ], forgetpassword
);

router.post(
    '/updatepassword',
    [
        
        check("new_password","Password is weak.").isStrongPassword(),
        check("confirm_password","Passwords do not match."),
        check("token", "Token is not present."),
    ], updatepassword
);

router.post(
    '/profile',
    [
        check("token","Token is not present"),
    ], profile
);

router.post(
    '/update',
    [
       
    ],update
);
module.exports = router
const express = require('express')
const router = express.Router()
const { check } = require("express-validator");
//const auth = require('../middleware/authMiddleware');
const { register, verify, login, forgetpassword, forgetpasswordverify, updatepassword } = require('../controller/subscriberController');
const { profile, update, emailChange, verify1, passwordChange } = require('../controller/subscriberProfile');

router.post(
    '/register',
    [
        check("username", "username should not be empty."),
        check("email", "Please enter valid email address.").isEmail(),
        check("password", "Weak password."),
        check("confirm-password", "password did not match")
    ], register
);

router.post(
    '/verify',
    [
    ], verify
);

router.post(
    '/login',
    [
        check("email", "Email should not be empty.").isEmail(),
        check("password", "Password field is required.")
    ], login
);

router.post(
    '/forgetpassword',
    [
        check("email", "Email should not be empty.").isEmail(),
    ], forgetpassword
);

router.post(
    '/forgetpasswordverify',
    [
        check("token", "Token is not present.")
    ],
    forgetpasswordverify
);
router.post(
    '/updatepassword',
    [
        check("new_password", "Password is weak."),
        check("confirm_password", "Passwords do not match."),
    ], updatepassword
);

router.post(
    '/profile',
    [
    ], profile
);

router.post(
    '/update',
    [
    ], update
);

router.post(
    '/emailchange',
    [
        check("new_email", "Email should be valid.").isEmail(),
    ], emailChange
);

router.post(
    '/verify1',
    [
    ], verify1
);

router.post(
    '/passwordchange',
    [
        check("old_password", "Password should not be empty"),
        check("new_password", "Passwrod should not be empty "),
    ], passwordChange
);

module.exports = router
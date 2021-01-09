const express = require('express')
const router = express.Router()
const { check } = require("express-validator");
const { register, verify, login, forgetpassword, forgetpasswordverify, updatepassword } = require('../controller/authorController');
const { profile, update, emailChange, verify1, passwordChange } = require('../controller/authorProfile');
const { createContent } = require('../controller/authorContentController');

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

    ],
    verify
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
    '/passwordchange',
    [
        check("old_password", "Password should not be empty"),
        check("new_password", "Password should not be empty "),
    ], passwordChange
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
    '/create-course',
    [
        check('title', "Title is required"),
        check('author', "Author is required."),
        check('description', "Description is required."),
        check('price', "Price is required."),
        check('for', "For is required."),
        check('platform', "Platform is required."),
        check('prerequisite', "Prerequisite is required."),
    ],
    createContent
);

module.exports = router
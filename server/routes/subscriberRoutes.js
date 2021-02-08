const express = require('express')
const router = express.Router()
const { check } = require("express-validator");
const multer = require('multer');
const { register, verify, login, forgetpassword, forgetpasswordverify, updatepassword } = require('../controller/subscriberController');
const { profile, update, emailChange, verify1, passwordChange, profileImageUpdate, profileImageView } = require('../controller/subscriberProfile');
const { courseHome,payment,verification } = require('../controller/subscriberContentController');
const { isLoggedIn } = require('../middleware/isLoggedInmiddleware');
const { protect } = require('../middleware/authMiddleware');


const storage = multer.memoryStorage({
    destination: function (req, file, callback) {
        callback(null, '')
    }
})
const upload = multer({ storage }).single('image');

router.post(
    '/register',
    [
        check("username", "username should not be empty."),
        check("email", "Please enter valid email address.").isEmail(),
        check("password", "Weak password."),
        check("confirm_password", "password did not match")
    ], register
);

router.post(
    '/verify', protect,
    [
    ], verify
);

router.post(
    '/login',
    [
        check("email", "Email should not be empty.").isEmail(),
        check("password", "Password field is required.").exists()
    ], login
);

router.post(
    '/forgetpassword',
    [
        check("email", "Email should not be empty.").isEmail(),
    ], forgetpassword
);

router.post(
    '/forgetpasswordverify', protect,
    [
        check("token", "Token is not present.")
    ],
    forgetpasswordverify
);
router.post(
    '/updatepassword', isLoggedIn,
    [
        check("new_password", "Password is weak."),
        check("confirm_password", "Passwords do not match."),
    ], updatepassword
);

router.post(
    '/profile', isLoggedIn,
    [
    ], profile
);

router.post(
    '/update', isLoggedIn, upload,
    [
    ], update
);

router.post(
    '/profileImageUpdate', isLoggedIn, upload,
    [], profileImageUpdate
)

router.post(
    '/profileImageView', isLoggedIn, [], profileImageView
)

router.post(
    '/emailchange', isLoggedIn,
    [
        check("new_email", "Email should be valid.").isEmail(),
    ], emailChange
);

router.post(
    '/verify1', protect,
    [
    ], verify1
);

router.post(
    '/passwordchange', isLoggedIn,
    [
        check("old_password", "Password should not be empty"),
        check("new_password", "Passwrod should not be empty "),
    ], passwordChange
);

router.post(
    '/courseHome',
    [
        check("courseId", "course ID is required.")
    ], courseHome
)

router.post(
    '/payment',isLoggedIn,
    [],payment
)

router.post(
    '/verification',
    [],verification)
module.exports = router
const express = require('express')
const router = express.Router()
const { check } = require("express-validator");
const multer = require('multer');
const { register, verify, login, forgetpassword, forgetpasswordverify, updatepassword } = require('../controller/authorController');
const { profile, update, emailChange, verify1, passwordChange, profileImageUpdate, profileImageView } = require('../controller/authorProfile');
const { createContent, createSection, myCourses, courseSections, uploadVideo, showVideo, thumbnailUpload, previewUpload } = require('../controller/authorContentController');
const { isLoggedIn } = require('../middleware/isLoggedInmiddleware');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage({
    destination: function (req, file, callback) {
        callback(null, '');
    }
})
const upload = multer({ storage }).single('image');
const uploadMultiple = multer({ storage }).array('image', 2);

router.post(
    '/register',
    [
        check("username", "username should not be empty.").isString(),
        check("email", "Please enter valid email address.").isEmail(),
        check("password", "Weak password."),
        check("confirm_password", "password did not match")
    ], register
);

router.post(
    '/verify', protect,
    [
        check("token", "Token can't be empty"),
    ],
    verify
);

router.post(
    '/forgetpasswordverify', protect,
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
    '/updatepassword', isLoggedIn,
    [
        check("new_password", "Password is weak."),
        check("confirm_password", "Passwords do not match."),

    ], updatepassword
);

router.post(
    '/profile', isLoggedIn,
    [], profile
);

router.post(
    '/update', isLoggedIn,
    [], update
);

router.post(
    '/passwordchange', isLoggedIn,
    [
        check("old_password", "Password should not be empty"),
        check("new_password", "Password should not be empty "),
    ], passwordChange
);

router.post(
    '/emailchange', isLoggedIn,
    [
        check("new_email", "Email should be valid.").isEmail(),
    ], emailChange
);

router.post(
    '/verify1', protect,
    [
        check("token", "Token can't be empty.").exists(),
    ], verify1
);

router.post(
    '/create-course', isLoggedIn, uploadMultiple,
    [
        check("title", "Title is required"),
        check('description', "Description is required."),
        check('category', "Category is required."),
        check('suitableFor', "For is required."),
        check('platform', "Platform is required."),
        check('prerequisite', "Prerequisite is required."),
    ],
    createContent
);

router.post(
    '/create-section', isLoggedIn,
    [
        check("number", "Number is required").exists(),
        check("sectionName", "Section name can't be empty").exists(),
        check('courseId', "CourseID is required.").exists()
    ],
    createSection
);

router.post('/courses', isLoggedIn, [], myCourses);

router.post(
    '/course/sections', isLoggedIn,
    [
        check('courseId', "CourseId is required.").exists()
    ],
    courseSections
)

router.post(
    '/add-video', isLoggedIn, upload,
    [
        check("image", "video is required"),
        check('sectionId', "SectionId is required."),
        check('videoName', "Video is required."),
    ],
    uploadVideo
);

router.post(
    '/uploadThumbnail', isLoggedIn, upload,
    [
        check("courseId", "course iD is must").exists(),
    ], thumbnailUpload
)

router.post(
    '/uploadPreview', isLoggedIn, upload,
    [
        check("courseId", "course iD is must").exists(),
    ], previewUpload
)
router.post(
    '/showVideo', isLoggedIn,
    [
        check("videoId", "video id is required").exists(),
    ], showVideo
)

router.post(
    '/profileImageUpdate', isLoggedIn, upload,
    [], profileImageUpdate
)

router.post(
    '/profileImageView', isLoggedIn, [], profileImageView
)
module.exports = router
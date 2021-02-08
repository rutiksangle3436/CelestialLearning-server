const asyncHandler = require('express-async-handler');

exports.isLoggedIn = asyncHandler(async (req, res, next) => {
    console.log("isLoggedIn Middleware envoked.");
    if (req.session.email) {
        console.log("Email : ", req.session.email);
        next();
    } else {
        console.log("Bad.");
        res.status(401);
        return res.json({
            message: "Unauthorised."
        });
    }
});
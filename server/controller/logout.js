const asyncHandler = require('express-async-handler');

exports.logout = asyncHandler(async (req, res, next) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return next(err);
            }else{
                res.status(200)
                return res.json({
                    messaga: "Log out successfully."
                });
            }
        });
    }
});
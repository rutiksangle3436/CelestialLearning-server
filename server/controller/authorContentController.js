const { validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

exports.createContent = asyncHandler(async (req, res) => {
    
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        res.status(400);
        return res.json(
            {
                message: errors.array()[0].msg
            }
        )
    }else{
        res.status(200);
        console.log("Ok.");
        res.json({
            status: 200
        })
    }
});
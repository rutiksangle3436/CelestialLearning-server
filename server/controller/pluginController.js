const asyncHandler = require('express-async-handler');
const { validationResult } = require("express-validator");
const { Log, LogSchema } = require('../models/pluginLogsModel');

exports.init = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400);
        return res.json({
            message: errors.array()[0].msg
        });
    }
    if (req.session.email) {
        req.session.plugin = "start";

        const filter = { email: req.session.email }
        const update = {
            updatedAt: Date.now(),
            lastUpdated: Date.now(),
            state: "Ok"
        }
        const options = {
            upsert: true,
            new: true,
        }
        const log = await Log.findOneAndUpdate(filter, update, options);
        await log.save()

        res.status(200)
        res.json({
            message: "Ok"
        });
    } else {
        res.status(400)
        res.json({
            message: "Bad"
        });
    }
    // req.sessionStore.get(user, function (error, session) {
    //     if (session) {
    //         console.log("session Found.");
    //         session.plugin = "start"
    //         req.sessionStore.set(user, session, function (error) {
    //             if (error) {
    //                 console.log(error);
    //                 res.status(400);
    //                 return res.jsonp({
    //                     message: false
    //                 })
    //             }
    //         });
    //         res.status(201);
    //         return res.jsonp({
    //             message: true
    //         });
    //     } else {
    //         res.status(400);
    //         return res.jsonp({
    //             message: false
    //         })
    //     }
    // });
});


exports.insertLog = asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400);
        res.json({
            message: errors.array().msg[0]
        })
    }

    const { status, tool } = req.body;

    const email = req.session.email;

    const logFile = await Log.findOne({ email });
    if (logFile) {
        var log = null;
        if (status == "Ok") {
            log = new LogSchema({
                status: status,
                createdAt: Date.now()
            })
        } else if (status == "Alert") {
            log = new LogSchema({
                status: status,
                tool: tool,
                createdAt: Date.now()
            })
            logFile.state = status;
        }

        await log.save();

        logFile.logs.push(log._id);

        logFile.lastUpdated = Date.now();

        await logFile.save()

        res.status(200);
        res.json({
            message: "Ok"
        });
    } else {
        res.status(400);
        res.json({
            message: "Bad request."
        });
    }
});
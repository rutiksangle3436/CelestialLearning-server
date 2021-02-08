const { SubscriberProfile } = require('../models/subscriberModel');
const { Subscriber } = require('../models/subscriberModel')
const asyncHandler = require('express-async-handler')
const { validationResult } = require("express-validator")
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
require('dotenv').config();
const sgMail = require('@sendgrid/mail')
const aws = require('aws-sdk')


//url: subscriber/profile
exports.profile = asyncHandler(async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(401);
        return res.json({
            message: errors.array()[0].msg,
        })
    }

    const email = req.session.email;
    const subscriber = await Subscriber.findOne({ email });
    if (subscriber) {
        const _id = (subscriber.profile_id);
        const profiledata = await SubscriberProfile.findOne({ _id: _id });
        if (profiledata) {

            res.status(200);
            return res.json({
                profiledata,
            }
            );
        }
        else {
            res.status(200);
            return res.json({
                message: "Profile not added.",
            })
        }
    }
    else {
        res.status(200);
        return res.json({
            message: "Incorrect subscriber details.",
        })
    }

})

//url: subscriber/profileImageView
exports.profileImageView = asyncHandler(async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(401);
        return res.json({
            message: errors.array()[0].msg,
        })
    }

    const email = req.session.email;
    const subscriber = await Subscriber.findOne({ email });
    if (subscriber) {
        const _id = (subscriber._id);
        const profile = await SubscriberProfile.findOne({ _id: subscriber.profile_id });
        if (profile) {
            url = `https://celestiallearning.s3.amazonaws.com/Subscriber_Profile_Images/${_id}.${profile.extension}`
            res.status(200);
            return res.json({

                url
            })
        }
        else {
            res.status(200);
            return res.json({
                message: "No such profile available"
            })
        }


    }
});
//url: subscriber/update
exports.update = asyncHandler(async (req, res) => {

    const { firstName, middleName, lastName, phNum, linkedInURL, twitterURL, areaOfInterest, higherEducation } = req.body;
    const email = req.session.email;

    const subscriber = await Subscriber.findOne({ email });
    const _id = subscriber.profile_id;
    const profile = await SubscriberProfile.findOne({ _id });
    const filter = { _id: await profile._id }

    if (profile) {
        const update = { firstName: firstName, middleName: middleName, lastName: lastName, phNum: phNum, linkedInURL: linkedInURL, twitterURL: twitterURL, areaOfInterest: areaOfInterest, higherEducation: higherEducation }
        await SubscriberProfile.findOneAndUpdate(filter, update,
            {
                useFindAndModify: false,
                new: true
            }
        )
        res.status(200);
        return res.json({
            message: "profile updated successfully"
        })

    }

    else {
        res.status(200);
        return res.json({
            message: "no such author exists.",
        })
    }
});

//url : subscriber/profileImageUpdate
exports.profileImageUpdate = asyncHandler(async (req, res) => {

    var flag = 0;
    const email = req.session.email;
    const subscriber = await Subscriber.findOne({ email });
    const _id = subscriber._id;

    if (req.file) {
        let myImage = req.file.originalname.split(".");
        fileExtension = myImage[myImage.length - 1];
        await SubscriberProfile.updateOne({ _id: subscriber.profile_id }, { extension: fileExtension });
        s3 = new aws.S3({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        })
        params = {
            Bucket: process.env.BUCKET_NAME,
            Key: `Subscriber_Profile_Images/${_id}.${fileExtension}`,
            Body: req.file.buffer,
            ACL: 'public-read'
        }
        flag = 1;
    }
    if (flag == 1) {
        s3.upload(params, (error, data) => {
            if (error) {
                res.status(500);
                return res.json({
                    message: `Error while uploading`,
                })
            }
            else {
                res.status(200);
                return res.json({
                    message: "profile image updated successfully"
                })
            }
        })
    }
})


//url:  subscriber/emailChange
exports.emailChange = asyncHandler(async (req, res) => {

    const { new_email, password } = req.body;
    const email = req.session.email;
    const user = await Subscriber.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        const subscriber = await Subscriber.findOne({ email: new_email });

        if (!subscriber) {
            const token = jwt.sign(
                {
                    new_email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: '1h'
                }
            )
            const emailData = {
                from: process.env.EMAIL_FROM,
                to: new_email,
                subject: 'Email reset Link',
                html: `
                            <h1>Please use the following Link to reset your email address</h1>
                            
                            <p>${process.env.CLIENT_URL}/subscriber/verify/${token}</p>
                            <hr />
                            <p>This Email Contains Sensitive Information</p>
                            <p>${process.env.CLIENT_URL}</p>
                        `
            };

            sgMail
                .send(emailData)
                .then(sent => {
                    return res.json({
                        message: `Email has been sent to ${new_email} ${token}`
                    });
                })
                .catch(error => {
                    res.status(400)
                    return res.json({
                        message: "Error while sending an email",
                    });
                });
        }
        else {
            return res.json({
                message: "email id already registered."
            })
        }

    }
    else {
        return res.json({
            message: "incorrect password",
        })
    }

})

//url:  subscriber/verify1
exports.verify1 = asyncHandler(async (req, res) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
        res.status(401)
        return res.json({
            message: "Token is missing",
        })
    }


    const { new_email } = jwt.decode(req.token);

    const email = req.session.email;

    const subscriber = await Subscriber.findOne({ email });
    if (subscriber) {


        const filter = { _id: subscriber._id }
        const update = { email: new_email }

        await Subscriber.findOneAndUpdate(filter, update,
            {
                useFindAndModify: false,
                new: true
            },
        )
        req.session.email = new_email;
        return res.json({
            message: "your email has been updated."
        })
    }
    else {
        return res.json({
            message: "no such user.",
        })
    }
});

//url:  subscriber/passwordChange
exports.passwordChange = asyncHandler(async (req, res) => {

    const { old_password, new_password } = req.body;
    const email = req.session.email;
    const subscriber = await Subscriber.findOne({ email });
    if (subscriber && (await subscriber.matchPassword(old_password))) {
        Subscriber.updateOne(
            { email: email },
            { password: new_password },
            (err) => {
                if (err) {
                    console.log(err)
                }
                else {
                    return res.json({
                        message: "Password changed",
                    })
                }
            }
        )
    }
    else {
        return res.json({
            message: "Incorrect password",
        })
    }
});
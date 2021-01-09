const { AuthorProfile } = require('../models/authorModel');
const { Author } = require('../models/authorModel')
const asyncHandler = require('express-async-handler')
const { validationResult } = require("express-validator")
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
require('dotenv').config();
const sgMail = require('@sendgrid/mail')

exports.profile = asyncHandler(async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(401);
        return res.json({
            message: errors.array()[0].msg,
        })
    }

    const email = req.session.email;
    const author = await Author.findOne({ email });
    if (author) {
        const _id = (author.profile_id);
        const profiledata = await AuthorProfile.findOne({ _id: _id });
        if (profiledata) {
            return res.json({

                message: profiledata,
            }
            );
        }
        else {
            return res.json({
                message: "Profile not added.",
            })
        }
    }
    else {
        return res.json({
            message: "Incorrect author details.",
        })
    }

})


exports.update = asyncHandler(async (req, res) => {

    const { token, firstName, middleName, lastName, phNum, linkedInURL, twitterURL, qualification, biography } = req.body;
    const email = req.session.email;

    const author = await Author.findOne({ email });
    const _id = author.profile_id;
    const profile = await AuthorProfile.findOne({ _id });
    const filter = { _id: await profile._id }
    if (profile) {
        const update = { firstName: firstName, middleName: middleName, lastName: lastName, phNum: phNum, linkedInURL: linkedInURL, twitterURL: twitterURL, qualification: qualification, biography: biography }
        await AuthorProfile.findOneAndUpdate(filter, update,
            {
                useFindAndModify: false,
                new: true
            },
        )
        return res.json({
            message: "author profile updated successfully"
        })
    }
    else {
        return res.json({
            message: "no such author exists.",
        })
    }
});

exports.emailChange = asyncHandler(async (req, res) => {

    const { new_email, password } = req.body;
    const email = req.session.email;
    const author = await Author.findOne({ email });

    if (author && (await author.matchPassword(password))) {
        const author = await Author.findOne({ email: new_email });

        if (!author) {
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
                            
                            <p>${process.env.CLIENT_URL}/author/verify/${token}</p>
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

exports.verify1 = asyncHandler(async (req, res) => {
    const error = validationResult(req);

    if (!error.isEmpty()) {
        res.status(401)
        return res.json({
            message: "Token is missing",
        })
    }

    const token = req.headers.authorization.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, async (err) => {
        if (err) {
            res.status(401)
            return res.json({
                message: "Token expires or invalid",
            })
        }
        else {
            const { new_email } = jwt.decode(token);

            const email = req.session.email;

            const author = await Author.findOne({ email });
            if (author) {


                const filter = { _id: author._id }
                const update = { email: new_email }

                await Author.findOneAndUpdate(filter, update,
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
                    message: "no such author.",
                })
            }
        }
    })
});


exports.passwordChange = asyncHandler(async (req, res) => {

    const { old_password, new_password } = req.body;
    const email = req.session.email;
    const author = await Author.findOne({ email });
    if (author && (await author.matchPassword(old_password))) {
        Author.updateOne(
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
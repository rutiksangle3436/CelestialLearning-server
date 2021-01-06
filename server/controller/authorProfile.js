const {AuthorProfile} = require('../models/authorModel');
const {Author} = require('../models/authorModel')
const asyncHandler = require('express-async-handler')
const { validationResult } = require("express-validator")
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
require('dotenv').config();

exports.profile = asyncHandler(async (req, res) => {
    
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        res.status(401);
        return res.json({
            "msg" : errors.array()[0].msg,
        })   
    }

    const { token } = req.body;
    jwt.verify(token, process.env.JWT_SECRET, async (err) => {
        if(err)
        {
            res.status(401)
            return res.json({
                "msg" : "Token expires or invalid",
            })
        }
        else
        {
            const {email} = jwt.decode(token);
            const author = await Author.findOne({email});
            if(author)
            {
                const _id = (author.profile_id); 
                const profiledata = await AuthorProfile.findOne({_id : _id});
                if(profiledata)
                {
                    res.json(
                        profiledata,        
                    );
                }
                else
                {
                    res.json({
                        message : "Profile not added.",
                    })
                }
            } 
            else
            {
                res.json({
                    message : "Incorrect author details.",
                })
            }  
        }
    })
});

exports.update = asyncHandler(async (req, res) => {

    const {token,firstName,middleName,lastName,phNum,linkedInURL,twitterURL,qualification,biography} = req.body;
    const {email} = jwt.decode(token);

    const author = await Author.findOne({email});
    const _id = author.profile_id; 
    const profile = await AuthorProfile.findOne({_id});
    const filter = {_id: await profile._id}
    if(profile)
    {
        const update = {firstName: firstName,middleName:middleName,lastName:lastName,phNum:phNum,linkedInURL:linkedInURL,twitterURL:twitterURL,qualification:qualification,biography:biography}
        await AuthorProfile.findOneAndUpdate(filter,update,
            {
                useFindAndModify: false,
                new: true
            },
        )
        return res.json({
            "message" : "author profile updated successfully"
        })
    }
    else
    {
        return res.json({
            "msg" : "no such author exists.",
        })
    }
    
    
    
});
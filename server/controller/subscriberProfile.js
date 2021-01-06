const {SubscriberProfile} = require('../models/subscriberModel');
const {Subscriber} = require('../models/subscriberModel')
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
            const subscriber = await Subscriber.findOne({email});
            if(subscriber)
            {
                const _id = (subscriber.profile_id); 
                const profiledata = await SubscriberProfile.findOne({_id : _id});
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
                    message : "Incorrect user details.",
                })
            }  
        }
    })
});

exports.update = asyncHandler(async (req, res) => {

    const {token,firstName,middleName,lastName,phNum,linkedInURL,twitterURL,higherEducation,areaOfInterest} = req.body;
    const {email} = jwt.decode(token);

    const subscriber = await Subscriber.findOne({email});
    const _id = subscriber.profile_id; 
    const profile = await SubscriberProfile.findOne({_id});
    const filter = {_id: await profile._id}
    const update = {firstName: firstName,middleName:middleName,lastName:lastName,phNum:phNum,linkedInURL:linkedInURL,twitterURL:twitterURL,higherEducation:higherEducation,areaOfInterest:areaOfInterest}
    await SubscriberProfile.findOneAndUpdate(filter,update,
        {
            useFindAndModify: false,
            new: true
        },
    )
    return res.json({
        "message" : "profile updated successfully"
    })
    
    
});
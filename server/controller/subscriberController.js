const {Subscriber} = require("../models/subscriberModel")
const {SubscriberProfile} = require("../models/subscriberModel")
const {createProfile,createSubscriber} = require 
const asyncHandler = require('express-async-handler')
const { validationResult } = require("express-validator")
const sgMail = require('@sendgrid/mail')
const auth = require('../middleware/authMiddleware')
const passwordStrength = require('check-password-strength')
const jwt = require('jsonwebtoken')
const e = require("express")
const { token } = require("morgan")
require('dotenv').config();
sgMail.setApiKey(process.env.SENDGRID_API)

exports.register = asyncHandler(async (req, res) => {
    
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        res.status(401);
        return res.json({
            "msg" : errors.array()[0].msg,
        })   
    }
    const { username, email, password, confirm_password } = req.body;

    const emailExists = await Subscriber.findOne({email});
    const usernameExists = await Subscriber.findOne({username});

    if(password != confirm_password){
        res.status(401);
        return res.json({
            "msg" : "Password did not match",
        }) 
    }

    if(usernameExists){
        res.status(401);
        return res.json({
            "msg" : "Username is already taken.",
        })
    }

    if(emailExists){
        res.status(401);
        return res.json({
            "msg" : "This email is already used.",
        })
        
    }

    const strength = passwordStrength(password);
    
    if(strength.length > 72){
        res.status(401);
        return res.json({
            "msg" : "Password is too Long",
        })
    }

    if(strength.value != "Strong"){
        res.status(401);
        return res.json({
            "msg" : "Weak Password",
        })
    }
    
    

    const user = new Subscriber({
        username: username,
        email: email,
        password: password,
        
    });

    const token = jwt.sign(
        {
            email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '1h'
        }
    )
    
    const emailData = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Account activation Link',
        html: `
                <h1>Please use the following Link to Activate your Account</h1>
            
                <p>${process.env.CLIENT_URL}/subscriber/verify/${token}</p>
                <hr />
                <p>This Email Contains Sensitive Information</p>
                <p>${process.env.CLIENT_URL}</p>
              `
      };

      sgMail
       .send(emailData)
       .then(async sent => {
            try
            {
                await user.save();
                res.status(200);
                console.log("User data saved.");
            }
            catch(err)
            {
                console.log(err);
            }
            return res.json({
            message: `Email has been sent to ${email} ${token}`
            });
        })
       .catch(error => {
         res.status(400)
         throw new Error(error)
       });
})

exports.verify = asyncHandler(async (req, res) => {
    const error = validationResult(req);

    if(!error.isEmpty())
    {
        res.status(401)
        return res.json({
            "msg" : "Token is missing",
        })
    }

    const token  = req.headers.authorization.split(' ')[1];
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
            const { email } = jwt.decode(token);
            const subscriber = await Subscriber.findOne({email});
            if(subscriber)
            {
                if(subscriber.status=="Inactive")
                {       
                    const filter = {email: email}
                    const update = {status: "Active"}
                
                    Subscriber.findOneAndUpdate(filter,update,
                    {
                        useFindAndModify: false,
                        new: true
                    },
                        async (err, doc) => {
                            if(err){
                                console.log(err)
                                res.json({
                                    msg: "Unregistered token." 
                                })
                            }
                            else{
                                if(doc){
                                    
                                    res.json({ msg: "Subscriber Activated." })
                                }
                                else{
                                        res.json({ msg: "Unregistered Token." })
                                }
                            }
                        }
                    )
                }
                else
                {
                    return res.json({
                        "msg" : "You have already activated your account.",
                    })
                }
            }
            else
            {
                return res.json({
                    "msg" : "This email does not exist",
                })
            }
            }
            
    })
})

exports.login = asyncHandler(async(req,res) => {
    const error = validationResult(req);
    if(!error.isEmpty())
    {
        res.status(401)
        return res.json({
            "msg" : "Invalid username",
        })
       
    }

    const {email,password} = req.body;
    
    const user = await Subscriber.findOne({email});

    if(!user)
    {
        res.status(404);
        return res.json({
            "msg" : "You are not registered.",
        })
        
    }
    if(user && (await user.matchPassword(password)))
    {
        if(await user.status == "Active")
        {
            const token = jwt.sign(
                {
                    email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: '1h'
                }
           )
            req.session.email = email;
            return res.json({
                "msg" : " You are logged in successfully.",
                "_id" : await user.id,
                "token" : token,
            })
        }
        else
        {
            res.json({
                "msg" :"Please activate your account.",
            })
        }
        
    }
    else
    {
        res.json({
            "msg" : "Incorrect username or password.",
        })
    }
});

exports.forgetpassword = asyncHandler(async(req,res) => {
    const error = validationResult(req);
    if(!error.isEmpty())
    {
        res.status(401)
        return res.json({
            "msg" : "Valid Email id is required.",
        })
       
    }

    const {email} = req.body;
    
    const user = await Subscriber.findOne({email});
    if(!user)
    {
        res.status(404);
        return res.json({
            "msg" : "Incorrect email id. Please enter registered email id.",
        })
       
    }
    else
    {
        const token = jwt.sign(
            {
                email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        )
        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Password reset Link',
            html: `
                    <h1>Please use the following Link to reset your password</h1>
                    
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
               message: `Email has been sent to ${email} ${token}`
             });
           })
           .catch(error => {
             res.status(400)
             throw new Error(error)
           });
           return res.json({
            "token" : token
        })
    }
});
exports.forgetpasswordverify = asyncHandler(async (req, res) => {
    const error = validationResult(req);

    if(!error.isEmpty())
    {
        res.status(401)
        return res.json({
            "msg" : "Token is missing",
        })
       
    }

    const token  = req.headers.authorization.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
        if(err){
            res.status(401)
            return res.json({
                "msg" : "Token expires or invalid",
            })
            
        }else{
            const { email } = jwt.decode(token);
            return res.json({
                "msg" : "success",
                "token": token,
            })
        }
    })
})

exports.updatepassword = asyncHandler(async(req,res) =>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        res.status(401);
        return res.json({
            "msg" : errors.array()[0].msg,
        })
        
    }

    const { new_password,confirm_password,token } = req.body
    //const token  = req.headers.authorization.split(' ')[1];
    if(new_password!=confirm_password)
    {
        res.status(404);
        return res.json({
            "msg" : "Passwords do not match.",
        })
        
    }
    const strength = passwordStrength(new_password);
   
    if(strength.length > 72){
        res.status(401);
        return res.json({
            "msg" : "Password is too Long",
        })
       
    }

    if(strength.value != "Strong"){
        res.status(401);
        return res.json({
            "msg" : "Weak Password",
        })
       
    }
    const { email } = jwt.decode(token);

    Subscriber.updateOne(
                    {email:email},
                    {password: new_password},
                    (err) => {
                        if(err){
                            console.log(err)
                        }
                        else{
                            res.json({
                                "msg": "Password changed",
                            })
                        }
                    }
                )
})
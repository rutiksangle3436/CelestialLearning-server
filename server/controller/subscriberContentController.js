const { validationResult } = require('express-validator');
const { Course, Section, Content } = require('../models/courseModel');
const asyncHandler = require('express-async-handler');
const { Author, AuthorProfile } = require("../models/authorModel");
const shortid = require('shortid')
const Razorpay = require('razorpay')
const crypto = require('crypto')

//url: susbcriber/courseHome
exports.courseHome = asyncHandler(async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400);
        return res.json({
            message: errors.array()[0].msg
        });
    }
    const { courseTitle } = req.body;
    
    const course = await Course.findOne({ title: courseTitle });
    const content = await Content.findOne({ _id: course.content });
    const sectionsId = content.section;
    const sectionData = [];
    for (i = 0; i < sectionsId.length; i++) {
        const sectionsData = await Section.findOne({ _id: sectionsId[i] });
        sectionData.push({
            "sectionNumber": sectionsData.number,
            "sectionName": sectionsData.sectionName
        });
    }
    const author = await Author.findOne({ _id: course.author });
    const profile = await AuthorProfile.findOne({ _id: author.profile_id });
    res.status(200);
    return res.json({
        title: course.title,
        price: course.price,
        suitableFor: course.suitableFor,
        description: course.description,
        category: course.category,
        prerequisite: course.prerequisite,
        authorName: `${profile.firstName} ${profile.middleName} ${profile.lastName}`,
        sectionData,
        courseThumbnail: `https://celestiallearning.s3.amazonaws.com/${course.courseSlug}/${course._id}_thumbnail.${course.thumbnailExtension}`,
        coursePreview: `https://celestiallearning.s3.amazonaws.com/${course.courseSlug}/${course._id}_preview.${course.previewExtension}`
    })
})

//url : subscriber/payment
exports.payment = asyncHandler(async(req,res)=>{

    //const email = req.session.email;
    //const subscriber = await Subscriber.findOne({email});
    //const subscriberProfile = await SubscriberProfile.findOne({_id:subscriber.profile_id})
    const razorpay = new Razorpay({
        key_id: process.env.key_id,
        key_secret: process.env.key_secret
    })
    console.log("i am here");
    const payment_capture = 1
	const {price} = req.body;
	const currency = 'INR'
    console.log(price)
	const options = {
		amount: price*100,
		currency,
		receipt: shortid.generate(),
		payment_capture
	}

	try {
        console.log("i am try catch")
		const response = await razorpay.orders.create(options)
		console.log(response)
		res.json({
			id: response.id,
            currency: response.currency,
            price: response.amount,
            //name : `${subscriberProfile.firstName} ${subscriberProfile.middleName} ${subscriberProfile.lastName}`,
            //contact : subscriberProfile.phNum,
            //email
		})
	} catch (error) {
		console.log(error)
	}
})

exports.verification = asyncHandler(async(req,res)=>{
    const secret = '123456'
    console.log(req.body)

	
	const shasum = crypto.createHmac('sha256', secret)
	shasum.update(JSON.stringify(req.body))
	const digest = shasum.digest('hex')

	console.log(digest, req.headers['x-razorpay-signature'])

	if (digest === req.headers['x-razorpay-signature']) {
		console.log('request is legit')
		// process it
		//require('fs').writeFileSync('payment1.json', JSON.stringify(req.body, null, 4))
	} else {
        // pass it
        console.log("request invalid")
	}
	res.json({ status: 'ok' })
})
	// do a validation
	

	


const { AuthorProfile, Author} = require('../models/authorModel');
const { Course } = require('../models/courseModel');
const asyncHandler = require('express-async-handler')
require('dotenv').config();

//url : /homePage
exports.homePage = asyncHandler(async(req,res)=>{
    const course = await Course.find();
    //console.log(course);
    const courseData = [];
    for(i=0;i<course.length;i++)
    {
        const author = await Author.findOne({_id:course[i].author});
        
        const profile = await AuthorProfile.findOne({_id:author.profile_id});
        courseData.push({
            "courseName" : course[i].title,
            "price" : course[i].price,
            "authorName" : `${profile.firstName} ${profile.middleName} ${profile.lastName}`,
            "courseThumbnail" : `https://celestiallearning.s3.amazonaws.com/${course[i].courseSlug}/${course[i]._id}_thumbnail.${course[i].thumbnailExtension}`
        })
        
    }
    res.status(200);
    return res.json({
        courseData
    })
})
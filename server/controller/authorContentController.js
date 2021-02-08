const { validationResult } = require('express-validator');
const { Course, Section, Content, Video } = require('../models/courseModel');
const asyncHandler = require('express-async-handler');
const { Author } = require("../models/authorModel");
const aws = require('aws-sdk')
const slug = require('slug')

//url : author/create-course
exports.createContent = asyncHandler(async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400);
        return res.json(
            {
                message: errors.array()[0].msg
            }
        )
    }
    const { title, description, category, suitableFor, platform, prerequisite } = req.body;


    const email = req.session.email;
    const author = await Author.findOne({ email });
    const _id = author._id;
    const course = new Course({
        author: _id,
        title: title,
        description: description,
        category: category,
        suitableFor: suitableFor,
        platform: platform,
        prerequisite: prerequisite,
        courseSlug: slug(title),
    });
    try {

        const { _id } = await course.save();
        console.log("Id : ", _id)
        const s3 = new aws.S3();
        const params = { Bucket: process.env.BUCKET_NAME, Key: `${course.courseSlug}/`, ACL: 'public-read', Body: 'body does not matter' };
        s3.upload(params, (err, data) => {
            if (err) {
                console.log(err)
            }
            else {
                console.log(data);
            }
        })

        res.status(200);
        return res.json({
            message: "Course content data saved.",
            courseId: _id
        });
    }
    catch (err) {
        res.status(400);
        return res.json({
            message: `Error ${err}`,
        })

    }
});

//url:  author/create-section
exports.createSection = asyncHandler(async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400);
        return res.json(
            {
                message: errors.array()[0].msg
            }
        )
    }
    const { number, sectionName, courseId } = req.body;
    const course = await Course.findOne({ _id: courseId });
    const section = new Section({
        number: number,
        sectionName: sectionName,
        sectionSlug: `${course.courseSlug}_${slug(sectionName)}`
    });
    try {
        const { _id } = await section.save();

        const sectionID = section._id;
        const s3 = new aws.S3();
        const params = { Bucket: process.env.BUCKET_NAME, Key: `${course.courseSlug}/${slug(section.sectionName)}/`, ACL: 'public-read', Body: 'body does not matter' };
        s3.upload(params, (err, data) => {
            if (err) {
                console.log(err)
            }
            else {
                console.log(data)
            }
        })

        if (course.content) {

            const content = await Content.findOne({ _id: course.content._id })

            await content.section.push(sectionID);
            await content.save()
        } else {
            const content = new Content();
            await content.section.push(sectionID);
            await content.save()
            await Course.updateOne({ _id: courseId }, { content: content._id });
        }

        res.status(200);
        return res.json({
            message: "Course section data saved.",
            sectionId: `${_id}`
        });
    }
    catch (err) {
        res.status(400);
        return res.json({
            message: `Error ${err}`,
        })

    }

});

//url:  author/courses
exports.myCourses = asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400);
        return res.json({
            message: errors.array()[0].msg
        });
    }

    const email = req.session.email;
    const author = await Author.findOne({ email });
    const courses = await Course.find({ author: author._id });
    const data = [];
    for (i = 0; i < courses.length; i++) {
        data.push({
            'thumbnail': `https://celestiallearning.s3.amazonaws.com/${courses[i].courseSlug}/${courses[i]._id}_thumbnail.${courses[i].thumbnailExtension}`,
            'courseId': courses[i]._id,
            'courseName': courses[i].title,
            'category': courses[i].category,
            'price': courses[i].price
        });
    }

    res.status(200);
    return res.json({
        // url: url,
        data
    })
});

//url:  author/course/sections
exports.courseSections = asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400);
        return res.json({
            message: errors.array()[0].msg
        });
    }

    const { courseId } = req.body;

    const course = await Course.findOne({ _id: courseId });

    const content = await Content.findOne(course.content._id);

    const sections = content.section;

    const sectionData = []

    for (i = 0; i < sections.length; i++) {

        const sdata = await Section.findOne({ _id: sections[i] });

        const videos = sdata.video;


        if (videos.length == 0) {
            sectionData.push({
                "sectionId": sdata._id,
                "number": sdata.number,
                "sectionName": sdata.sectionName,
                "videoId": "NIL",
                "videoName": "NIL"
            })
        }
        else {
            const videoData = []
            for (j = 0; j < videos.length; j++) {

                const vdata = await Video.findOne({ _id: videos[j] });

                var path = vdata.videoSlug;
                path = path.split("_");
                const url = `https://celestiallearning.s3.amazonaws.com/${path[0]}/${path[1]}/${path[2]}`;
                console.log(url)
                videoData.push({
                    "videoId": vdata._id,
                    "videoName": vdata.name,
                    "videoURL": url,
                })

            }
            sectionData.push({
                "sectionId": sdata._id,
                "number": sdata.number,
                "sectionName": sdata.sectionName,
                "video": videoData,
            })
            console.log(sectionData);
        }
    }

    res.status(200);
    return res.json({
        sections: sectionData,

    });
});

//url:  author/add-video
exports.uploadVideo = asyncHandler(async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400);
        return res.json({
            message: errors.array()[0].msg
        });
    }

    //const obj = JSON.parse(JSON.stringify(req.body));

    //const vedioName = obj.vedioName
    //const sectionId = obj.sectionId
    const { vedioName, sectionId } = req.body;
    let myVideo = req.file.originalname.split(".");
    const fileExtension = myVideo[myVideo.length - 1];

    const section = await Section.findOne({ _id: sectionId });
    const video = new Video({
        name: vedioName,
        videoSlug: `${section.sectionSlug}_${slug(vedioName)}.${fileExtension}`
    })
    await video.save();

    await section.video.push(video._id);
    await section.save()

    const fileName = `${video.videoSlug}`;
    const path = fileName.split("_");

    const s3 = new aws.S3({
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    })

    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${path[0]}/${path[1]}/${path[2]}`,
        Body: req.file.buffer,
        ACL: 'public-read'
    }
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
                message: `successful`,
            })
        }
    })
});

//url:  author/uploadThumbnail
exports.thumbnailUpload = asyncHandler(async (req, res) => {

    const obj = JSON.parse(JSON.stringify(req.body));

    const courseId = obj.courseId;

    if (req.file) {
        let myCourseThumbnail = req.file.originalname.split(".");
        fileExtensionThumbnail = myCourseThumbnail[myCourseThumbnail.length - 1];
        const course = await Course.findOne({ _id: courseId });
        const s3 = new aws.S3();
        await Course.updateOne({ _id: courseId }, {
            thumbnailExtension: fileExtensionThumbnail,

        }),
            (err) => {
                res.status(401);
                return res.json({ err });
            }

        const param = { Bucket: process.env.BUCKET_NAME, Key: `${course.courseSlug}/${course._id}_thumbnail.${fileExtensionThumbnail}`, ACL: 'public-read', Body: req.file.buffer };
        s3.upload(param, (err, data) => {
            if (err) {
                res.status(401);
                return res.json({ err });
            }
            else {
                res.status(200);
                return res.json({
                    message: "thumbnail uploaded",
                })
            }
        })
    }
})

//url : author/uploadPreview
exports.previewUpload = asyncHandler(async (req, res) => {

    const obj = JSON.parse(JSON.stringify(req.body));

    const courseId = obj.courseId;

    if (req.file) {

        let myCoursePreview = req.file.originalname.split(".");
        fileExtensionPreview = myCoursePreview[myCoursePreview.length - 1];
        const course = await Course.findOne({ _id: courseId });
        const s3 = new aws.S3();
        await Course.updateOne({ _id: courseId }, {

            previewExtension: fileExtensionPreview
        }),
            (err) => {
                res.status(401);
                return res.json({ err });
            }


        const previewParam = { Bucket: process.env.BUCKET_NAME, Key: `${course.courseSlug}/${course._id}_preview.${fileExtensionPreview}`, ACL: 'public-read', Body: req.file.buffer };
        s3.upload(previewParam, (err, data) => {
            if (err) {
                res.status(401);
                return res.json({ err });
            }
            else {
                res.status(200);
                return res.json({
                    message: "preview uploaded.",
                })
            }
        })
    };
})

//url:  author/showVideo
exports.showVideo = asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400);
        return res.json({
            message: errors.array()[0].msg
        });
    }
    const { videoId } = req.body;
    const video = await Video.findOne({ _id: videoId });
    var path = video.videoSlug;
    path = path.split("_");

    res.json({
        message: `https://celestiallearning.s3.amazonaws.com/${path[0]}/${path[1]}/${path[2]}`,
    })
})


/*exports.trial = asyncHandler(async (req, res) => {

    // const s3Client = new aws.S3({
    //     accessKeyId: process.env.AWS_ACCESS_KEY,
    //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    // });

    // const downloadParams = {
    //     Bucket: process.env.BUCKET_NAME,
    //     Key: `${path[0]}/${path[1]}/${path[2]}`,
    // };

    // s3Client.getObject(downloadParams, function (err, data) {
    //     if (err) {
    //         res.status(400);
    //         return res.json({
    //             message: `error => ${err}`
    //         })
    //     }
    //     else {
    //         res.status(200);
    //         return res.json({
    //             //message: `succsessful =>${data}`,
    //             message: `https://celestiallearning.s3.amazonaws.com/blockchain/etherum/metamask.mp4`,
    //         })
    //     }
    // })


    //const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
    //const ffmpeg = require('fluent-ffmpeg');
    //ffmpeg.setFfmpegPath(ffmpegPath);
    // open input stream
    var infs = new ffmpeg

    infs.addInput('https://celestiallearning.s3.amazonaws.com/6003f5ed51c397175752b206_preview.mp4').outputOptions([
        '-map 0:0',
        '-map 0:1',
        '-map 0:0',
        '-map 0:1',
        '-s:v:0 2160x3840',
        '-c:v:0 libx264',
        '-b:v:0 2000k',
        '-s:v:1 960x540',
        '-c:v:1 libx264',
        '-b:v:1 365k',
        // '-var_stream_map', '"v:0,a:0 v:1,a:1"',
        '-master_pl_name master.m3u8',
        '-f hls',
        '-max_muxing_queue_size 1024',
        '-hls_time 1',
        '-hls_list_size 0',
        '-hls_segment_filename', 'v%v/fileSequence%d.ts'
    ]).output('./video.m3u8')
        .on('start', function (commandLine) {
            console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
        .on('error', function (err, stdout, stderr) {
            console.log('An error occurred: ' + err.message, err, stderr);
        })
        .on('progress', function (progress) {
            console.log('Processing: ' + progress.percent + '% done')
        })
        .on('end', function (err, stdout, stderr) {
            console.log('Finished processing!')

        })
        .run()
    const s3 = new aws.S3();
    const params = { Bucket: process.env.BUCKET_NAME, Key: `react-native/expo-setup/v0/`, ACL: 'public-read', Body: '/home/saumya/Desktop/Celestial Learning/CelestialLearning-server/v0' };
    s3.upload(params, (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            console.log("uppdate");
        }
    })
    <Panel header= {sectionData.sectionName} key={sectionData.sectionNumber}>
                        <p>
                            <a href="#vid">Video1</a>
                        </p>
                        <p>
                            <a href="#vid">Video2</a>
                        </p>
                        <p>
                            <a href="#vid">Video3</a>
                        </p>
                    </Panel> 
                    <Panel header="Section 2" key="2">
                        <p>
                            <a href="#vid">Video1</a>
                        </p>
                        <p>
                            <a href="#vid">Video2</a>
                        </p>
                        <p>
                            <a href="#vid">Video3</a>
                        </p>
                    </Panel>
                    <Panel header="Section 3" key="3">
                        <p>
                            <a href="#vid">Video1</a>
                        </p>
                        <p>
                            <a href="#vid">Video2</a>
                        </p>
                        <p>
                            <a href="#vid">Video3</a>
                        </p>
                    </Panel>
                    <Panel header="Section 4" key="4">
                        <p>
                            <a href="#vid">Video1</a>
                        </p>
                        <p>
                            <a href="#vid">Video2</a>
                        </p>
                        <p>
                            <a href="#vid">Video3</a>
                        </p>
                    </Panel>
                    <Panel header="Section 5" key="5">
                        <p>
                            <a href="#vid">Video1</a>
                        </p>
                        <p>
                            <a href="#vid">Video2</a>
                        </p>
                        <p>
                            <a href="#vid">Video3</a>
                        </p>
                    </Panel>
                    <Panel header="Section 6" key="6">
                        <p>
                            <a href="#vid">Video1</a>
                        </p>
                        <p>
                            <a href="#vid">Video2</a>
                        </p>
                        <p>
                            <a href="#vid">Video3</a>
                        </p>
                    </Panel>
})*/
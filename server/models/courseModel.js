const mongoose = require('mongoose');

const videoSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    videoSlug: {
        type: String
    }
}, {
    versionKey: false,
});

const Video = new mongoose.model('Video', videoSchema)

const sectionSchema = mongoose.Schema({
    number: {
        type: Number,
        required: true
    },
    sectionName: {
        type: String,
        required: true
    },
    video: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }],
    sectionSlug: {
        type: String
    }

}, {
    versionKey: false,
});

const Section = new mongoose.model('Section', sectionSchema)

const contentSchema = mongoose.Schema(
    {
        section: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Section'
        }]
    }, {
    versionKey: false,
}
);

const Content = new mongoose.model('Content', contentSchema);

const courseSchema = mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Author'
        },
        title: {
            type: String,
            required: true,
            unique: true,
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: false,
            default: 0
        },
        suitableFor: [{
            type: String
        }],
        platform: {
            type: String
        },
        category: {
            type: String,
            required: true
        },
        prerequisite: [{
            type: String
        }],
        courseSlug: {
            type: String
        },
        thumbnailExtension: {
            type: String,
            default: "NA"
        },
        previewExtension: {
            type: String,
            default : "NA"
        },
        content: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Content',
        }
    }, {
    versionKey: false,
}
);

const Course = new mongoose.model('Course', courseSchema);

module.exports = {
    Course: Course,
    Content: Content,
    Section: Section,
    Video: Video
}

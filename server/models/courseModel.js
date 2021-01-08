const mongoose = require('mongoose');

const videoSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    path: {
        type: String
    }
})

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
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }

})

const Section = new mongoose.model('Section', sectionSchema)

const contentSchema = mongoose.Schema(
    {
        section: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Section'
        }]
    }
)

const Content = new mongoose.model('Content', contentSchema)

const cousrsSchema = mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Author'
        },
        title: {
            type: String,
            required: true
        },
        descriprion: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        for: [{
            type: String
        }],
        platform: {
            type: String
        },
        prerequisite: {
            type: String
        },
        content: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Content'
        }
    }
);

const Course = new mongoose.model('Course', cousrsSchema); 

module.exports = {
    Course: Course,
    Content: Content,
    Section: Section,
    Video: Video
}

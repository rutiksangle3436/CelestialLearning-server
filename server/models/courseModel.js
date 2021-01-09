const mongoose = require('mongoose');
const slug = require('slug')
const videoSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    videoSlug: {
        type: String
    }
});

videoSchema.pre('save' | 'update', async () => {
    this.videoSlug = this.name;
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
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    },
    sectionSlug: {
        type: String
    }

});

sectionSchema.pre('save' | 'update', async () => {
    this.sectionSlug = slug(this.sectionName);
});

const Section = new mongoose.model('Section', sectionSchema)

const contentSchema = mongoose.Schema(
    {
        section: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Section'
        }]
    }
);

const Content = new mongoose.model('Content', contentSchema);

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
        courseSlug: {
            type: String
        },
        content: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Content'
        }
    }
);

cousrsSchema.pre('save' | 'update', async () => {
    this.courseSlug = slug(this.title);
});

const Course = new mongoose.model('Course', cousrsSchema); 

module.exports = {
    Course: Course,
    Content: Content,
    Section: Section,
    Video: Video
}

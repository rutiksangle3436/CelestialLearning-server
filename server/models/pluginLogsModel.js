const mongoose = require('mongoose');

const logSchema = mongoose.Schema(
    {
        status: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        tool: {
            type: String,
        }
    },
    {
        versionKey: false
    }
);

const LogSchema = mongoose.model('LogSchema', logSchema);

const log = mongoose.Schema(
    {
        email: {
            type: String,
            required: true
        },
        lastUpdated: {
            type: Date,
        },
        state: {
            type: String,
            default: "Ok"
        },
        logs: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "LogSchema"
        }]
    },
    {
        versionKey: false
    }
);

const Log = mongoose.model('Log', log);

module.exports = {
    LogSchema: LogSchema,
    Log: Log
}
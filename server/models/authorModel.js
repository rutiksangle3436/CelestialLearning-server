const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const authorProfile = mongoose.Schema(
  {
    firstName: {
      type :String,
      default : "NA",
    },
    middleName: {
      type :String,
      default : "NA",
    },
    lastName: {
      type :String,
      default : "NA",
    },
    phNum: {
      type :String,
      default : "NA",
    },
    linkedInURL: {
      type :String,
      default : "NA",
    },
    twitterURL: {
      type :String,
      default : "NA",
    },
    qualification: {
      type: String,
      default : "NA",
    },
    biography: {
      type : String,
      default : "NA",
    }
  },{
    versionKey:false,
  }
);

const AuthorProfile = mongoose.model('AuthorProfile',authorProfile)

const authorSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "Inactive",
    },
    profile_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthorProfile"
    },
  },{
    versionKey:false,
  }
);


authorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

authorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  const profile = new AuthorProfile();
  profile.save();
  this.profile_id = profile._id;
})

authorSchema.pre('updateOne', async function(next) {
  const salt = await bcrypt.genSalt(10)
  this._update.password = await bcrypt.hash(this._update.password, salt)
 })

const Author = mongoose.model('Author', authorSchema)

module.exports = {Author: Author, AuthorProfile : AuthorProfile}
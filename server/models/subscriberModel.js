const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const subscriberProfile = mongoose.Schema(
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
    higherEducation: {
      type: String,
      default : "NA",
    },
    areaOfInterest: {
      type : String,
      default : "NA",
    }
  },{
    versionKey:false,
  }
);
const SubscriberProfile = mongoose.model('SubscriberProfile',subscriberProfile)

const subscriberSchema = mongoose.Schema(
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
      
      default: "Inactive",
    },
    profile_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriberProfile"
    }
  },{
    versionKey:false,
  }
);




subscriberSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

subscriberSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  const profile = new SubscriberProfile();
  profile.save();
  this.profile_id = profile._id;
})

subscriberSchema.pre('updateOne', async function(next) {
  const salt = await bcrypt.genSalt(10)
  this._update.password = await bcrypt.hash(this._update.password, salt)
 })

 const Subscriber = mongoose.model('Subscriber', subscriberSchema)


module.exports = {Subscriber: Subscriber, SubscriberProfile : SubscriberProfile}


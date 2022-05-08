const mongoose = require('mongoose')
const db = require('../pool').app()

const profile = new mongoose.Schema({
  publicId: String,
  linkedin: mongoose.Schema.Types.Mixed,
  google: mongoose.Schema.Types.Mixed,
  twitter: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  photoInformation: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  expire_at: { type: Date, default: Date.now, expires: 10000 }
});

module.exports = db.model('profiles', profile)
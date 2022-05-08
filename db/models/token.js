const mongoose = require('mongoose')
const db = require('../pool').app()

const token = new mongoose.Schema({
  id: {
    type: Number
  },
  code: {
    type: String
  }
});

module.exports = db.model('tokens', token)
const mongoose = require('mongoose');
const User = require('./user');
let gallerySchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  createdAt:{
    type: Date,
    default: Date.now
  },
  imgUrl:{  
        type: String 
    } 
});


module.exports = mongoose.model('Gallery', gallerySchema);

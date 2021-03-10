const mongoose = require('mongoose');

let hallSchema = new mongoose.Schema({
name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  checkIn:{
    type: Date,
    required: true,
   
  },
  
  createdAt:{
    type: Date,
    default: Date.now
  }
 
});


module.exports = mongoose.model('Hall', hallSchema);

const mongoose = require('mongoose');

let bookSchema = new mongoose.Schema({
name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
  checkIn:{
    type: Date,
    required: true,
   
  },
  checkOut:{
    type: Date,
    required: true,
    
  },
  createdAt:{
    type: Date,
    default: Date.now
  }
 
});


module.exports = mongoose.model('Book', bookSchema);

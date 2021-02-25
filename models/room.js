const mongoose = require('mongoose');
const User = require('./user');
let RoomSchema = new mongoose.Schema({
category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
 cost: {
    type: Number,
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


module.exports = mongoose.model('Room', RoomSchema);

const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

let userSchema = new mongoose.Schema({
  username:String,
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password:{
    type: String,
    select: false
  },
tokens:[{
  access:{
    type: String,
    required: true
  },
  token:{
    type: String,
    required: true,
  }
}],
resetPasswordToken : String,
resetPasswordExpires : Date

})
userSchema.plugin(passportLocalMongoose,{usernameField: 'username', emailField: 'email'});

module.exports = mongoose.model('User', userSchema);
const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

const bodyParser = require('body-parser');
const path = require('path');

const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const localStrategy = require('passport-local').Strategy;

const Router = require('./routes/index');
const Gallery = require('./routes/gallery');
const Book = require('./routes/bookRoom');
const Auth = require('./routes/auth');
const Room = require('./routes/rooms');
const Hall = require('./routes/hall');
const User = require('./models/user');

const connectDB = require('./config/db');

require('dotenv').config();

const cloudinary = require('cloudinary');
require('./handler/cloudinary');
const upload = require('./handler/multer');

connectDB();

const app = express();

//setting up view engine, path and body-parser
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//setting up express-session 
app.use(
  session({
    secret: "mysecret",
    resave: true,
    saveUninitialized: true
  })
);

passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy({ usernameField: 'username' },
  User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware for connect flash
app.use(flash());

//setting up messages globally
app.use((req, res, next) => {
  res.locals.success_msg = req.flash(('success_msg'));
  res.locals.error_msg = req.flash(('error_msg'));
  res.locals.currentUser = req.user;
  next();
})

app.use(Router);
app.use(Auth);
app.use(Gallery);
app.use(Book);
app.use(Room);
app.use(Hall)


const port = process.env.PORT || 6000;
app.listen(port, () => console.log(`server up on port ${port}`))
const express = require('express');
const router = express.Router();
const passport = require('passport');
const nodemailer = require('nodemailer');

const User = require('../models/user');
const { request } = require("express");
// const { ensureAuth, ensureGuest} = require('../middleware/auth');


//login get route

router.get('/login',  (req, res) => {
  res.render('auth/login');
});

//signup get route
router.get('/signup',  (req, res) => {
  res.render('auth/signup');
});

// login post route
router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  falureRedirect: '/login'
}))

// signup post route
router.post('/signup', (req, res) => {
  let { username, email, password } = req.body;
  let userData = {
    username,
    email
  };
  User.findOne({ username: req.body.username },{ email: req.body.email }, function (err, user) {
    if (err)
      console.log(err);
    if (user) {
      req.flash("error_msg", "A user with that username already exists...");
      res.redirect("/signup");
    } else {
      User.register(userData, password, (err) => {
        if (err) {
          console.log(err)
          res.redirect('/signup');
        }
        passport.authenticate('local')(req, res, () => {
          req.flash("success_msg", "Account Created Successfully");
          console.log('Account Created Successfully');
          res.redirect('/login')
        });
      });
    }
  });
});


// logout route
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You Are logged Out')
  res.redirect('/login');
})

//Forgot Password Get route
router.get('/forgot', (req, res) => {
  res.render('auth/forgot');
});

//Forgot Password Reset Get route
router.get('/reset/:token', (req, res) => {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
    .then(user => {
      if (!user) {
        req.flash('error_msg', 'Password reset token is invalid or has expired');
        res.redirect('/forgot');
      }
      res.render('auth/change', { token: req.params.token });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR:' + err);
      res.redirect('/forgot');
    })
});

//Forgot Password Post route 
router.post('/forgot', (req, res, next) => {
  let recoveryPassword = '';
  async.waterfall([
    (done) => {
      crypto.randomBytes(20, (err, buf) => {
        let token = buf.toString('hex');
        done(err, token);
      });
    },
    (token, done) => {
      User.findOne({ email: req.body.email })
        .then(user => {
          if (!user) {
            req.flash('error_msg', 'User does not exist with this email');
            return res.redirect('/forgot');
          }
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 1800000; //1/2 hour

          user.save(err => {
            done(err, token, user);
          });
        })
        .catch(err => {
          req.flash('error_msg', 'ERROR:' + err);
          res.redirect('/forgot');
        })
    },
    (token, user) => {
      let smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.GMAIL_EMAIL,
          pass: process.env.GMAIL_PASSWORD
        }
      });
      let mailOptions = {
        to: user.email,
        from: 'OG Ventures chinonsoubadire2@gmail.com',
        subject: "Recovery Email from OG Ventures' Blog",
        text: 'Please click the following link to recover your password:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' + 'If you did not request this, please ignore this email.'
      };
      smtpTransport.sendMail(mailOptions, err => {
        req.flash('success_msg', 'Email sent with further instructions. Please check that.');
        res.redirect('/forgot');
      })
    }
  ], err => {
    if (err) res.redirect('/forgot');
  });
});

//Reset Password Post  Route
router.post('/reset/:token', (req, res) => {
  async.waterfall([
    (done) => {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
        .then(user => {
          if (!user) {
            req.flash('error_msg', 'Password reset token is invalid or has expired');
            res.redirect('/forgot');
          }
          if (req.body.password !== req.body.confirmpassword) {
            req.flash('error_msg', "Password don't match");
            return res.redirect('/forgot');
          }
          user.setPassword(req.body.password, err => {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(err => {
              req.logIn(user, err => {
                done(err, user);
              })
            });
          });
        })
        .catch(err => {
          req.flash('error_msg', 'ERROR:' + err);
          res.redirect('/forgot');
        });
    },
    (user) => {
      let smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.GMAIL_EMAIL,
          pass: process.env.GMAIL_PASSWORD
        }
      });
      let mailOptions = {
        to: user.email,
        from: 'OG Ventures chinonsoubadire2@gmail.com',
        subject: 'Your Password is changed',
        text: 'Hello, ' + user.username + '\n\n' +
          'This is a confirmation that the password for your account' + user.email + 'has been changed.'
      };
      smtpTransport.sendMail(mailOptions, err => {
        req.flash('success_msg', 'Email sent with further instructions. Please check that.');
        res.redirect('/login');
      });
    }
  ], err => {
    res.redirect('/login');
  });
});


// Change Password Get Route
router.get('/changepassword', (req, res) => {
  res.render('auth/change');
});

// Change Password Get Route
router.get('/new', (req, res) => {
  res.render('auth/new');
});

//New Password Post  Route
router.post('/newpassword',  (req, res) => {
  if (req.body.password !== req.body.confirmpassword) {
    req.flash('error_msg', "Password don't match. Type Again!");
    return res.redirect('/newpassword');
  }
  User.findOne({ email: req.user.email })
    .then(user => {
      user.setPassword(req.body.password, err => {
        user.save()
          .then(user => {
            req.flash('success_msg', 'Password Changed Successfully.');
            res.redirect('/dashboard')
          })
          .catch(err => {
            req.flash('error', 'ERROR: ' + error);
            res.redirect('/newpassword');
          })
      })
    })
});


module.exports = router;
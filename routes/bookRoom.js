const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Book = require('../models/book');
const User = require('../models/user');


router.get('/book', (req, res) => {
  res.render('book/reserveRoom');
});


// Post routes Add Room
router.post('/booknow', async (req, res, next) => {
  try {
    const book = new Book()
    book.name = req.body.name,
    book.email = req.body.email,
    book.address = req.body.address,
    book.phone = req.body.phone,
    book.checkIn = req.body.checkIn,
    book.checkOut = req.body.checkOut
    await book.save()
    req.flash('success_msg', 'Your booking was received, we will contact you shortly')
    res.redirect('/book')
  }
  catch (err) {
    req.flash('error_msg', 'ERROR: +err');
    console.error(err);
    res.redirect('/booknow');
  }
});

// Get routes edit/:id
router.get("/edit/:id", async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    res.render('book/edit', { book});
  }
  catch (err) {
    req.flash('error_msg', 'ERROR: +err');
    res.redirect('/reservation');
  }
});

router.post('/edit/:id', async (req, res) => {
  try {
    let book = await Book.findById(req.params.id)
    if (!book) {
      return res.render('error/404');
    } else {
      book = await Book.findByIdAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })
      req.flash('success_msg', 'Reservation updated successfully');
      res.redirect('/reservation');
    }
  } catch (err) {
    req.flash('error_msg', 'ERROR: +err');
    res.redirect('/reservation');
    console.error(err)
  }
});

//delete request starts here
router.post("/delete/:id", async (req, res) => {
  try {
    // Find room by id
    let book = await Book.findById(req.params.id);

    // Delete room from db
    await book.remove();
    req.flash('success_msg', 'Checked Out  successfully');
    res.redirect('/reservation');
  } catch (err) {
    req.flash('error_msg', 'ERROR: +err');
    res.redirect('/reservation');
  }
});

router.get("/reservation", (req, res) => {
  Book.find({})
    .then(books => {
      res.render('book/dashboard', { books: books });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/login');
    })
});


router.get("/users", (req, res) => {
  User.find({})
    .then(users => {
      res.render('book/users', { users: users });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/login');
    })
});



module.exports = router;
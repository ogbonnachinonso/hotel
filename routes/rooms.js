const express = require('express');
const router = express.Router();
const Room = require('../models/room');
const User = require('../models/user');

const path = require('path');

require('dotenv').config();
const cloudinary = require('cloudinary');
require('../handler/cloudinary');
const upload = require('../handler/multer');


router.get('/book', (req, res) => {
  res.render('book/bookRoom');
});

router.get('/rooms', (req, res) => {
  Room.find({})
    .then(rooms => {
      res.render('rooms/room', { rooms: rooms });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/');
    })
});


// Get routes room by id
router.get('/rooms/:id', (req, res) => {
  Room.findOne({ _id: req.params.id })
    .then((room) => {
      res.render('rooms/roomDetails', { room: room });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/rooms');
      console.error(err)
    });
});


router.get('/addRoom', (req, res) => {
  res.render('rooms/add');
});

// Post routes Add Room
router.post('/myRoom', upload.single('image'),async (req, res, next) => {
  try {
    const result = await cloudinary.v2.uploader.upload(req.file.path)
    const room = new Room()
    room.category = req.body.category
    room.description = req.body.description
    room.cost = req.body.cost
    room.imgUrl = result.secure_url

    await room.save()
    req.flash('success_msg', 'Your Room has been added successfully')
    res.redirect('/rooms')
  }
  catch (err) {
    req.flash('error_msg', 'ERROR: +err');
    console.error(err);
    res.redirect('/addRoom');
  }
});

// Get routes edit/:id
router.get("/editRoom/:id", upload.single('image'), async (req, res) => {
  try {
    const room = await Room.findOne({ _id: req.params.id });
    res.render('rooms/edit', { room });
  }
  catch (err) {
    req.flash('error_msg', 'ERROR: +err');
    res.redirect('/roomDash');
  }
});

router.post('/editRoom/:id', upload.single('image'),async (req, res) => {
  try {
    let room = await Room.findById(req.params.id)
    if (!room) {
      return res.render('error/404');
    } else {
      room = await Room.findByIdAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })
      req.flash('success_msg', 'Room details updated successfully');
      res.redirect('/roomDash');
    }
  } catch (err) {
    req.flash('error_msg', 'ERROR: +err');
    res.redirect('/roomDash');
    console.error(err)
  }
});

//delete request starts here
router.post("/deleteRoom/:id", async (req, res) => {
  try {
    // Find room by id
    let room = await Room.findById(req.params.id);
    // Delete image from cloudinary
    await cloudinary.uploader.destroy(room.imgUrl);

    // Delete room from db
    await room.remove();
    req.flash('success_msg', 'Checked Out  successfully');
    res.redirect('/roomDash');
  } catch (err) {
    req.flash('error_msg', 'ERROR: +err');
    res.redirect('/roomDash');
  }
});

router.get("/roomDash", (req, res) => {
  Room.find({})
    .then(rooms => {
      res.render('rooms/roomDash', { rooms: rooms });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/login');
    })
});


module.exports = router;
const express = require('express');
const router = express.Router();
const Gallery = require('../models/gallery');
const Hall = require('../models/hall');
const Eventhall = require('../models/eventhall');

const path = require('path');

require('dotenv').config();
const cloudinary = require('cloudinary');
require('../handler/cloudinary');
const upload = require('../handler/multer');


router.get('/addHall', (req, res) => {
  res.render('hall/add');
});

// Get routes room by id
router.get('/halls/:id', (req, res) => {
  Eventhall.findOne({ _id: req.params.id })
    .then((eventhall) => {
      res.render('hall/halldetails', { eventhall: eventhall });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/halls');
      console.error(err)
    });
});


// Post routes Add Room
router.post('/ourHall', upload.single('image'),async (req, res, next) => {
  try {
    const result = await cloudinary.v2.uploader.upload(req.file.path)
    const eventhall = new Eventhall()
    eventhall.category = req.body.category
    eventhall.description = req.body.description
    eventhall.cost = req.body.cost
    eventhall.imgUrl = result.secure_url

    await eventhall.save()
    req.flash('success_msg', 'Your Hall has been added successfully')
    res.redirect('/halls')
  }
  catch (err) {
    req.flash('error_msg', 'ERROR: +err');
    console.error(err);
    res.redirect('/addHall');
  }
});

// Get routes edit/:id
router.get("/editHall/:id", upload.single('image'), async (req, res) => {
  try {
    const eventhall = await Eventhall.findOne({ _id: req.params.id });
    res.render('hall/edithalls', { eventhall});
  }
  catch (err) {
    req.flash('error_msg', 'ERROR: +err');
    res.redirect('/ourhalls');
  }
});

router.post('/editHall/:id', upload.single('image'),async (req, res) => {
  try {
    let eventhall = await Eventhall.findById(req.params.id)
    if (!eventhall) {
      return res.render('error/404');
    } else {
      eventhall = await Eventhall.findByIdAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })
      req.flash('success_msg', 'Hall details updated successfully');
      res.redirect('/ourhalls');
    }
  } catch (err) {
    req.flash('error_msg', 'ERROR: +err');
    res.redirect('/ourhalls');
    console.error(err)
  }
});

//delete request starts here
router.post("/deleteHall/:id", async (req, res) => {
  try {
    // Find room by id
    let eventhall = await Eventhall.findById(req.params.id);
    // Delete image from cloudinary
    await cloudinary.uploader.destroy(eventhall.imgUrl);

    // Delete room from db
    await room.remove();
    req.flash('success_msg', 'Checked Out  successfully');
    res.redirect('/ourhalls');
  } catch (err) {
    req.flash('error_msg', 'ERROR: +err');
    res.redirect('/ourhalls');
  }
});



router.get("/ourhalls", (req, res) => {
  Eventhall.find({})
    .then(eventhalls => {
      res.render('hall/ourhall', { eventhalls: eventhalls });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/');
    })
});




module.exports = router;
const express = require('express');
const router = express.Router();
const Gallery = require('../models/gallery');
const bodyParser = require("body-parser")

const path = require('path');

require('dotenv').config();
const cloudinary = require('cloudinary');

require('../handler/cloudinary');
const upload = require('../handler/multer');


router.get('/gallery', (req, res) => {
  Gallery.find({})
    .then(galleries => {
      res.render('gallery/gallery', { galleries: galleries });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/');
    })
});
// Get routes add gallery
router.get('/create', (req, res) => {
  res.render('gallery/add');
});

// Post routes Add gallery
router.post('/create', upload.single('image'), async (req, res, next) => {
  try {
    const result = await cloudinary.v2.uploader.upload(req.file.path)
    const gallery = new Gallery()
    gallery.description = req.body.description
    gallery.imgUrl = result.secure_url
    await gallery.save()
    req.flash('success_msg', 'Gallery created Successfully')
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.redirect('/create');
  }
});



// Get routes gallery by id
router.get('/gallery/:id', (req, res) => {
  Gallery.findOne({ _id: req.params.id })
    .then((gallery) => {
      res.render('gallery/galleryDetails', { gallery: gallery });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/gallery');
      console.error(err)
    });
});

// Get routes edit gallery
router.get("/editGallery/:id", upload.single('image'), async (req, res) => {
  try {
    let gallery = await Gallery.findById(req.params.id);
    res.render('gallery/edit', { gallery });
  }
  catch (err) {
    console.error(err)
    req.flash('error_msg', 'ERROR: +err');
    res.redirect('/dashboard');
  }

});
// Post routes edit gallery
router.post('/editGallery/:id', upload.single("image"), async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id)
    // Delete image from cloudinary
    await cloudinary.uploader.destroy(gallery.imgUrl);
    // Upload image to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);
    let data = {
      category: req.body.category,
      description: req.body.description,
      cost: req.body.cost,
      imgUrl: result.secure_url
    };
    await Gallery.findByIdAndUpdate({ _id: req.params.id }, data, {
      new: true,
      // runValidators: true,
    })
    req.flash('success_msg', 'Gallery updated successfully');
    res.redirect('/dashboard')


  }
  catch (err) {
    req.flash('error_msg', 'ERROR: +err');
    res.redirect('/dashboard');
    console.error(err)
  }
});


//delete request starts here

router.post("/deleteGallery/:id", async (req, res) => {
  try {
    // Find gallery by id
    let gallery = await Gallery.findById(req.params.id);
    // Delete image from cloudinary
    await cloudinary.uploader.destroy(gallery.imgUrl);
    // Delete gallery from db
    await gallery.remove();
    req.flash('success_msg', 'Gallery image deleted successfully');
    res.redirect('/dashboard');

  } catch (err) {
    console.log(err);
    req.flash('error_msg', 'ERROR: +err');
    res.redirect('/dashboard');
  }
});


// Get route dashboard
router.get("/dashboard", (req, res) => {
  Gallery.find({})
    .then(galleries => {
      res.render('gallery/dashboard', { galleries: galleries });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/login');
    })
});

module.exports = router;

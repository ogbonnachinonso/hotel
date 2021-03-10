const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Gallery = require('../models/gallery');
const Hall = require('../models/hall');
const Eventhall = require('../models/eventhall');
// landing page
//get route
router.get('/', (req, res) => {
  res.render('index');
});


router.get('/hall', (req, res) => {
  res.render('hall/reservehall');
});

router.get('/addHall', (req, res) => {
  res.render('hall/add');
});

router.get("/halls", (req, res) => {
  Eventhall.find({})
    .then(eventhalls => {
      res.render('hall/halls', { eventhalls: eventhalls });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/');
    })
});

router.get("/bookings", (req, res) => {
  Hall.find({})
    .then(halls => {
      res.render('hall/reserved', { halls: halls });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/');
    })
});

// Post routes Add Room
router.post('/bookhall', async (req, res, next) => {
  try {
    const hall = new Hall()
    hall.name = req.body.name,
    hall.category = req.body.category,
    hall.phone = req.body.phone,
    hall.checkIn = req.body.checkIn,
    
    await hall.save()
    req.flash('success_msg', 'Your booking was received, we will contact you shortly')
    res.redirect('/halls')
  }
  catch (err) {
    req.flash('error_msg', 'ERROR: +err');
    console.error(err);
    res.redirect('/bookhall');
  }
});

// Get routes edit/:id
router.get("/editReserved/:id", async (req, res) => {
  try {
    const hall = await Hall.findOne({ _id: req.params.id });
    res.render('hall/editreserved', { hall});
  }
  catch (err) {
    req.flash('error_msg', 'ERROR: +err');
    res.redirect('/bookings');
  }
});

router.post('/editReserved/:id', async (req, res) => {
  try {
    let hall = await Hall.findById(req.params.id)
    if (!hall) {
      return req.flash('error_msg', 'ERROR: +err');;
    } else {
      hall = await Hall.findByIdAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })
      req.flash('success_msg', 'Reservation updated successfully');
      res.redirect('/bookings');
    }
  } catch (err) {
    req.flash('error_msg', 'ERROR: +err');
    res.redirect('/bookings');
    console.error(err)
  }
});

//delete request starts here
router.post("/deleteReserved/:id", async (req, res) => {
  try {
    // Find room by id
    let hall = await Hall.findById(req.params.id);

    // Delete room from db
    await hall.remove();
    req.flash('success_msg', 'Checked Out  successfully');
    res.redirect('/bookings');
  } catch (err) {
    req.flash('error_msg', 'ERROR: +err');
    res.redirect('/bookings');
  }
});

router.get("/bookings", (req, res) => {
  Hall.find({})
    .then(halls => {
      res.render('hall/halls', { halls: halls });
    })
    .catch(err => {
      req.flash('error_msg', 'ERROR: +err');
      res.redirect('/');
    })
});


router.get('/contact', (req, res) => {
  res.render('folio');
});

router.post('/send', (req, res) => {
  const output = `
      <p>You have a new contact request</p>
      <h3>Contact Details</h3>
      <ul>  
        <li>Name: ${req.body.name}</li>
        <li>Email: ${req.body.email}</li>
        <li>Subject: ${req.body.subject}</li>
      </ul>
      <h3>Message</h3>
      <p>${req.body.message}</p>
    `;

  let transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      hall: "5c45eea5672f36",
      pass: "70b8eb187fa5d5"
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: req.body.email, // sender category
    to: 'minnahogbu@gmail.com', // list of receivers
    subject: 'Message From OgbFolio', // Subject line
    text: req.body.message, // plain text body
    html: output // html body
  };

  // send mail with defined transport object
  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    // res.send(  'Your Email Has Been Sent Successfully' );
    req.flash('success_msg', 'Your Email Has Been Sent Successfully');
    res.redirect('/contact')

  });

});

module.exports = router;
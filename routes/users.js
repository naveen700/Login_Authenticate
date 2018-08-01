var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './uploads' });
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;





/* GET home page. */

router.get('/register', function (req, res, next) {
  res.render('register1', { title: 'register' });


})

router.get('/member', function (req, res, next) {
  res.render('members', { title: 'members' });
})

router.get('/login', function (req, res, next) {
  res.render('login', { title: 'login' });
})
// after Login
router.post('/login',
  passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: 'Invalid username  and password' }),
  function (req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user
    req.flash('success', 'You Are Now Logged In');
    res.redirect('/');
  });


passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.getUserById(id, function (err, user) {
    done(err, user);
  });
});


passport.use(new LocalStrategy(function (username, password, done) {
  User.getUserByUsername(username, function (err, user) {
    if (err) throw err;
    if (!user) {
      return done(null, false, { message: 'Unknown user' });
    }

    User.comparePassword(password, user.password, function (err, isMatch) {
      if (err) return done;
      if (isMatch) {
        return done(null, user);
      }
      else {
        return done(null, false, { message: 'Invalid Password' });
      }


    })


  })




}))



router.post('/register', upload.single('profileimage'), function (req, res, next) {
  //here we cannot use bodyparser for the file upload, we will use  multer
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  console.log(name + email + username);
  if (req.file) {
    console.log("File Uploading...");
    var profileimage = req.file.filename;

  } else {
    var profileimage = 'noimage.jpeg';
    console.log('No File Uploaded');

  }

  // fomr validator 
  req.checkBody('name', 'Name Field is  Required').notEmpty();
  req.checkBody('email', 'Please  Enter Email').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Please  Enter Username').notEmpty();
  req.checkBody('password', 'Please Enter Password').notEmpty();
  req.checkBody('password2', 'Password don  not match').equals(req.body.password);



  // check errors
  var errors = req.validationErrors();
  if (errors) {
    res.render('register1', {
      errors: errors
    });
    console.log(errors);

  }
  else {
    console.log('No Errors');
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileimage: profileimage
    })

    User.createUser(newUser, function (err, user) {
      if (err) {
        throw err;
      }
      console.log(user);

    });
    req.flash('success', 'You Now registered and can login');
    res.location('/');
    res.redirect('/');

  }
});


router.get('/logout', function(req,res){
  req.logout();
  req.flash('success' , 'You are logged out');
  res.redirect('/users/login');
})

module.exports = router;

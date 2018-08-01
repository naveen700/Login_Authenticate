var express = require('express');
var router = express.Router();



router.get('/',ensureAuthentication, function (req, res, next) {
  res.render('index', { title: '/' });
});

function ensureAuthentication(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/users/login');

}



module.exports = router;
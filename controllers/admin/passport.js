'use strict';
var express = require('express');
var router = express.Router();
var UserModel = require('../../models/user_model');

const passport          =     require('passport');
const LocalStrategy = require('passport-local').Strategy;
//const axios = require('axios');

passport.use(new LocalStrategy(
    function(userdata, done) {
        console.log(userdata);
        return done(null, userdata);
    }
));
  
  // tell passport how to serialize the user
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((obj, done) => {
    done(null, obj);
    
  });
  
  // [END setup]
  
  
  
  router.get('/loginWith_passport',function(req,res,next){
    
    
    passport.authenticate('local', (err, user, info) => {
     
      if(info) {return res.send(info.message)}
      if (err) { return next(err); }
      if (!user) { return res.redirect('/login?auth=failed'); }
      req.login(user, (err) => {
       
        if (err) { return next(err); }
        return res.redirect('/admin/emaillogin/authrequired');
      })
      
    })(req, res, next);
  });
  
  router.get('/authrequired', (req, res) => {
    if(req.isAuthenticated()) {
      console.log('you hit the authentication endpoint\n');
      res.redirect('/admin/user/welcome');
    } else {
      res.redirect('/admin/login?auth=failed');
    }
  });

module.exports = router;
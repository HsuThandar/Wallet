'use strict';
var express = require('express');
var router = express.Router();
var UserModel = require('../../models/user_model');

var CONFIG = require('../../helpers/config');
const passport          =     require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
//const axios = require('axios');
passport.use(new GoogleStrategy({
  clientID: CONFIG.google_oauth_client.GOOGLE_CLIENT_ID,
  clientSecret: CONFIG.google_oauth_client.GOOGLE_CLIENT_SECRET,
 // callbackURL: "https://52.74.25.139:10001/admin/emaillogin/auth/google/callback"
 callbackURL: "https://localhost:10001/admin/emaillogin/auth/google/callback"
},
function(accessToken, refreshToken, profile, done) {
     console.log("profile");
     console.log(profile);

     var userObj = {
      gmailId : profile.id,
      gmailName : profile.displayName,
      loginaccount : profile.emails[0].value
    }
    UserModel.GmailLogin(userObj,function(err,result){
      if(err){
        return done("User not found");
      }else{
        console.log("callback from gmail login function of user model");
        console.log(result);
        return done(null, result);
      }
  });
}
));
  // configure passport.js to use the local strategy
  passport.use(new LocalStrategy(
    { usernameField: 'loginaccount' },
    (loginaccount, password, done) => {
     
      console.log('Inside local strategy callback')
      // here is where you make a call to the database
      // to find the user based on their username or email address
      // for now, we'll just pretend we found that it was users[0]
      //const user = users[0];
      const user =   {
        loginaccount : loginaccount,
        password : password
      }
      UserModel.checkUserExist(user,function(err,result){
          if(err){
            return done("User not found");
          }else{
            return done(null, result);
          }
      });
    }
  ));
  
  passport.use(new FacebookStrategy({
    clientID: CONFIG.facebook.app_id,
    clientSecret: CONFIG.facebook.app_secret,
    callbackURL: "https://localhost:10001/admin/emaillogin/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    //console.log("profile");
    //console.log(profile.id);
    var userObj = {
      facebookId : profile.id,
      facebookName : profile.displayName
    }
    UserModel.FacebookLogin(userObj,function(err,result){
      if(err){
        return cb("User not found");
      }else{
        console.log("callback from facebook login function of user model");
        //console.log(result);
        return cb(null, result);
      }
  });
  
}));


// tell passport how to serialize the user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  UserModel.getUserDataByID(user.enduser_id, function (err, user) {
      done(err, user);
  });
});

/*

  // tell passport how to serialize the user
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((obj, done) => {
    done(null, obj);
    
  });
  */
  // [END setup]
  
  
  
router.post('/loginWithUsernamePassword',function(req,res,next){
    console.log('Inside POST /loginWithUsernamePassword callback')
    
    passport.authenticate('local', (err, user, info) => {
      //console.log('Inside passport.authenticate() callback');
      // console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
      //console.log(`req.user: ${JSON.stringify(req.user)}`)
     //console.log(info);
      if(info) {return res.send(info.message)}
      if (err) { return res.redirect('/admin/login?auth=failed'); }
      if (!user) { return res.redirect('/admin/login?auth=failed'); }
      req.login(user, (err) => {
        //console.log('Inside req.login() callback')
        //console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
        //console.log(`req.user: ${JSON.stringify(req.user)}`)
        if (err) { return next(err); }
        return res.redirect('/admin/emaillogin/authrequired');
      })
      
    })(req, res, next);
  });
  
  router.get('/authrequired', (req, res) => {
   
    if(req.isAuthenticated()) {
      console.log('you hit the authentication endpoint\n');
       console.log("req.session.passport");
      // console.log(req.session.passport);
       //console.log(req.session.passport.user.enduser_id);
        UserModel.update_lastlogin_by_enduser_id(req.session.passport.user.enduser_id,function(err,result){
            if(err){
              
              res.redirect('/admin/login?auth=failed');
            }else{
              //todo: send email about successful login
              req.session.save(function(err) {console.log(err);});
              res.redirect('/admin/user/welcome');
            }
        });
     
    } else {
      res.redirect('/admin/login?auth=failed');
    }
  });


 
router.get('/auth/facebook',passport.authenticate('facebook'));
 
router.get('/auth/facebook/callback',
  
  passport.authenticate('facebook', { failureRedirect: '/admin/login?auth=failed' }),
    function(req, res) {
      console.log("facebook authenticate user data");
     // console.log(req.user);
        req.login(req.user, (err) => {
         
          if (err) { return next(err); }
          return res.redirect('/admin/emaillogin/authrequired');
        });
        
  });
  

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile','email'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/admin/login?auth=failed' }),
  function(req, res) {
    console.log("gmail authenticate user data");
      //console.log(req.user);
    req.login(req.user, (err) => {
         
      if (err) { return next(err); }
      return res.redirect('/admin/emaillogin/authrequired');
    });
    
});

module.exports = router;
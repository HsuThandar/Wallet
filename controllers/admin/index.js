'use strict';
var express = require('express');
var router = express.Router();
router.use(require('../../middlewares/auth'));
var UserModel = require('../../models/user_model');
var resData = {}; //CONFIG.facebook_accountkit_data;
const domainname = require('../../helpers/config').domainname;

var emailExistence = require('email-existence');

const fs = require('fs');
const Guid = require('guid');
const Mustache  = require('mustache');
const Request  = require('request');
const Querystring  = require('querystring');


  
var csrf_guid = Guid.raw();
const account_kit_api_version = 'v1.1';
const app_id = '2426640714059891';
const app_secret = 'f5ee1a7fa8cb6608343565ac2f7405d7';
const me_endpoint_base_url = 'https://graph.accountkit.com/v1.1/me';
const token_exchange_base_url = 'https://graph.accountkit.com/v1.1/access_token'; 

router.get('/signup', function(req, res) {
 
  res.render('frontend/signup', {	
 
    domainname:domainname,
    error:null,
    //appId: app_id,
    //csrf: csrf_guid,
    //version: account_kit_api_version,
  
  });
});




router.post('/facebook_login_success', function(request, response){

  // CSRF check
  if (request.body.csrf === csrf_guid) {
    var app_access_token = ['AA', app_id, app_secret].join('|');
    var params = {
      grant_type: 'authorization_code',
      code: request.body.code,
      access_token: app_access_token
    };
  
    // exchange tokens
    var token_exchange_url = token_exchange_base_url + '?' + Querystring.stringify(params);
    Request.get({url: token_exchange_url, json: true}, function(err, resp, respBody) {
      var view = {
        user_access_token: respBody.access_token,
        expires_at: respBody.expires_at,
        user_id: respBody.id,	
      };
   
      // get account details at /me endpoint
      var me_endpoint_url = me_endpoint_base_url + '?access_token=' + respBody.access_token;
      Request.get({url: me_endpoint_url, json:true }, function(err, resp, respBody) {
        // send login_success.html
        console.log(respBody);
        if (respBody.phone) {
          view.phone_num = respBody.phone.number;
        } else if (respBody.email) {
          view.email_addr = respBody.email.address;
        }
        
        //save in db
        //res.redirect('/admin/login');
      });
    });
  } 
  else {
    // login failed
    response.render('frontend/signup', {	
      domainname:domainname,
      error:"Something went wrong."
    });
  }
});



router.get('/login', function(req, res) {
  var error = false;
   if(req.query.auth == "failed" || req.session.customerror == "failed"){
     error = true;
   }
  
   res.render('frontend/login', {	
    
     domainname:domainname,
     error:error
   
   });
 });


router.post('/account_signup', function(req, res,next) {
  const request = require('request');
  const CONFIG = require('../../helpers/config');
  //console.log(req.body);
  var userdata  = req.body;
  delete userdata['g-recaptcha-response'];
  emailExistence.check(userdata.loginaccount, function(error, response){ 
    // checking login account is email or phone
      if(error){
        
        res.render('frontend/signup', {	
          domainname:domainname,
          error:"Email Error!"
        });
      }else{
        console.log("response");
        console.log(response);
          if(response){
              //save account
              saveUser(userdata,res);
              
          }else{
            const phone  = require('phone');
 
            var is_phone = phone(userdata.loginaccount);
            if(is_phone.length>0){
              //todo: send confirm code
              saveUser(userdata,res);
            }else{
               res.render('frontend/signup', {	
                domainname:domainname,
                error:"Phone number not exist Error!Phone number must be real and need country code."
              });
            }
             
          }
      }
      
  });
  /*
  const secretKey = CONFIG.google_reCAPTCHA.secret_key;
  const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body + "&remoteip=" + req.connection.remoteAddress;
  request(verificationURL,function(error,response,body) {
    body = JSON.parse(body);
    if(body.success !== undefined && !body.success) {
      return res.json({"responseError" : "Failed captcha verification"});
    }else{
      //user is not robot
        
 
    }
   
  });
*/
});


function saveUser(userdata,res){
            delete userdata.password2;
              UserModel.checkUserAlreadyRegister(userdata.loginaccount,function(c_error,c_result){
                if(c_error){
                    console.log(c_error);
                    res.render('frontend/signup', {	
                      domainname:domainname,
                      error:"Email or phone number already exist."
                    });
                }else{
                  if(c_result.length > 0){
                    res.render('frontend/signup', {	
                      domainname:domainname,
                      error:"Email or phone number already exist."
                    });
                  }else{
                    UserModel.saveuser(userdata,function(err,result){
                        if(err){
                          
                          res.render('frontend/signup', {	
                            domainname:domainname,
                            error:"Failed to create account. Server Error."
                          });
                        }else{
                          res.redirect('/admin/login');
                          
                        }
                    });
                  }
                  
                }
              });
}


router.get('/dashboard', function(req, res) {
  
  res.render('admin/index', {	
    bodypage: 'welcome',
    domainname:req.domainname,
    error:null,
		status:null
  
});
  
});

router.get('/verify', function(req, res) {
	res.redirect('/admin/login');
});


// Deletes the user's credentials and profile from the session.
// This does not revoke any active tokens.
router.get('/logout', (req, res) => {
 // console.log("user logout");
 req.session.destroy();
 delete req.session;
  req.logout();
  
  res.redirect('/admin/login');
});

router.use('/emaillogin', require('./emaillogin'));
router.use('/user', require('./user_controller'));
router.use('/common', require('./common_controller'));
router.use('/mmpaywallet', require('./mmpay_wallet_controller'));
router.use('/banking', require('./banking_controller'));
router.use('/transactionlog', require('./transaction_log_controller'));
router.use('/business', require('./business_controller'));
router.use('/howto', require('./howto_controller'));


module.exports = router;
'use strict';
const express = require('express');
const router = express.Router();
const api = require('../../models/home_model');
const moment = require('moment');
console.log("home controller loaded!");

router.get('/', function(req, res) {
    
    res.render('frontend/index', {	
         bodypage: 'home',
         domainname:req.domainname,
         error:false,
         pathname:'home'
        
    });
});

router.get('/forgetpassword', function(req, res) {
    
    res.render('frontend/forgetpassword', {	
         domainname:req.domainname,
         error:false,
         text:false

    });
});

router.post('/resetpassword', function(req, res) {
    
    if(req.body.emailorphone){
       var checkloginaccount = require('../../models/user_model').checkUserAlreadyRegister;
       checkloginaccount(req.body.emailorphone,function(notfound,found){
           if(notfound){
            res.render('frontend/forgetpassword', {	
                    domainname:req.domainname,
                    error:true,
                    text:false
                
            });
           }else{
                if(found.length>0){
                    var enduser_id = found[0].enduser_id;
                    var randomize = require('randomatic');
                    var token = randomize('A0', 10);
                    var code = randomize('0', 4);
                    //save code in db
                    var obj = {
                        enduser_id : enduser_id,
                        reset_code : code,
                        reset_token : token
                    }
                  
                    var insertResetPassword = require('../../models/helper_model').insertResetPassword;
                    insertResetPassword(obj,function(noinsert,insert){
                        if(noinsert){
                            res.render('frontend/forgetpassword', {	
                                domainname:req.domainname,
                                error:true
                                ,
                                text:false
                            });
                        }else{
                            const phone  = require('phone');
        
                            var is_phone = phone(req.body.emailorphone);
                            if(is_phone.length>0){
                                res.render('frontend/comfirmResetPassword', {	
                                        domainname:req.domainname,
                                        error:false,
                                        text:"We will send an verification code to your phone.",
                                        v_token : token
                                });
                            }else{
                                var emailExistence = require('email-existence');
                                emailExistence.check(req.body.emailorphone, function(error, response){
                                    if(error){
                                    
                                        res.render('frontend/forgetpassword', {	
                                                domainname:req.domainname,
                                                error:true,
                                                text:false
                                            
                                        });
                                    }else{
                                        if(response){
                                            var ejs=require('ejs');
                                            var sendingemail = require('../../controllers/admin/sendingemail');
                                            var mailOptions = {
                                                from: 'hninnumml@gmail.com',
                                                to: 'hninnumml@gmail.com',
                                                subject: 'Reset password instructions',
                                                
                                                };
                                                var async = require('async');
                                                async.waterfall([
                                                    function(callback) {
                                                        
                                                        ejs.renderFile(__dirname +'/forgetpasswordemail.ejs', {
                                                            code: code,
                                                            name: found[0].loginaccount
                                                          },function(notemplate,template){
                                                              if(notemplate){
                                                                mailOptions.text = code;
                                                                callback(null,mailOptions );
                                                              }else{
                                                                
                                                                mailOptions.html = template;
                                                                callback(null,mailOptions );
                                                              }
                                                          });
                                                         
                                                    }
                                                ], function (err, result) {
                                                    
                                                    sendingemail.sendEmail(result,function(nosend,send){
                                                        if(nosend){
                                                            res.render('frontend/forgetpassword', {	
                                                                domainname:req.domainname,
                                                                error:true
                                                                ,
                                                                text:false
                                                            });
                                                        }else{
                                                            res.render('frontend/comfirmResetPassword', {	
                                                                domainname:req.domainname,
                                                                error:false,
                                                                text:"We will send an verification code to your email.",
                                                                v_token : token
                                                            });
                                                        }
                                                    });
                                                    
                                                });
                                                
                                           

                                           
                                       
                                            
                                            
                                        }else{
                                            res.render('frontend/forgetpassword', {	
                                                    domainname:req.domainname,
                                                    error:true,
                                                    text:false
                                                
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                    
                }else{
                res.render('frontend/forgetpassword', {	
                        domainname:req.domainname,
                        error:true,
                        text:false
                    
                });  
               }
                
           }
       });
    }else{
        res.render('frontend/forgetpassword', {	
            domainname:req.domainname,
            error:true,
            text:false
           
       });
    }
    
});


router.post('/confirmresetpassword', function(req, res) {
    var getResetCodeviaV_token = require('../../models/helper_model').getResetCodeviaV_token;
    getResetCodeviaV_token(req.body.v_token,function(nocode,result){
        if(nocode){
            res.render('frontend/forgetpassword', {	
                domainname:req.domainname,
                error:true
                ,
                text:false
            });
        }else{
            if(result.length > 0){
                console.log(req.body.code)
                if(result[0].reset_code == req.body.code){
                    var now = moment(new Date()); //todays date
                    var end = moment(result[0].reset_date); // another date
                    var timediff =now.diff(end,'minutes');
                    console.log(timediff);
                    if(timediff > 5){
                        res.render('frontend/forgetpassword', {	
                            domainname:req.domainname,
                            error:true
                            ,
                            text:false
                        });
                    }else{
                        //redirect to new password link
                        res.render('frontend/newpassword',{
                            domainname:req.domainname,
                            v_token : req.body.v_token,
                            error:false
                        });
                    }
                }else{
                    res.render('frontend/forgetpassword', {	
                        domainname:req.domainname,
                        error:true
                        ,
                        text:false
                    });
                }
                
                
            }else{
                res.render('frontend/forgetpassword', {	
                    domainname:req.domainname,
                    error:true
                    ,
                    text:false
                });
            }

        }
    });
});


router.post('/newpassword', function(req, res) {
    if(req.body.password == req.body.password2){
        var savenewpassword = require('../../models/user_model').savenewpassword;
        savenewpassword(req.body,function(error,result){
            if(error){
                res.render('frontend/newpassword',{
                    domainname:req.domainname,
                    v_token : req.body.v_token,
                    error:true,
                    text:"Password and Confirm password must be same."
                }); 
            }else{
                var update_is_reset = require('../../models/helper_model').update_is_reset;
                update_is_reset(req.body.v_token,function(noupdate,update){
                    if(noupdate){
                        res.render('frontend/newpassword',{
                            domainname:req.domainname,
                            v_token : req.body.v_token,
                            error:true,
                            text:"Password and Confirm password must be same."
                        }); 
                    }else{
                        res.redirect('/admin/login');
                    }
                });
               
            }
        });
    }else{
        res.render('frontend/newpassword',{
            domainname:req.domainname,
            v_token : req.body.v_token,
            error:true,
            text:"Password and Confirm password must be same."
        });
    }
});

router.get('/contact', function(req, res) {
    res.render('frontend/index', {	
        bodypage: 'contacthome',
        domainname:req.domainname,
        error:false,
        pathname:'contact'
    });
   
});


router.post('/contactFormsubmit', function(req, res) {

    var contactModel = require('../../models/contact_model');
    contactModel.SaveEnquiryForm(req.body,function(error,result){
        if(error){
            res.render('frontend/index', {	
                bodypage: 'contacthome',
                domainname:req.domainname,
                error:true,
                text : "Cant send it now. Try again."
               
           });
        }else{
            res.render('frontend/index', {	
                bodypage: 'contacthome',
                domainname:req.domainname,
                error:false,
                text:"Successfully sent."
               
           });
        }
    });
});


router.get('/how_it_works', function(req, res){
    res.render('frontend/index', {	
        bodypage: 'how_it_works',
        domainname:req.domainname,
        error:false,
        pathname:'how_it_works'
    });
});
module.exports = router;
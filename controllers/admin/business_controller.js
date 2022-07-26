'use strict';
var express = require('express');
var router = express.Router();

var BusinessModel = require('../../models/business_model');
var HelperModel = require('../../models/helper_model');
var callback_link = require('../../helpers/config').api.callback_link;

router.get('/getAllBusinessList_foreachuser',function(req,res){
  
    BusinessModel.getAllBusinessList_foreachuser(req.query,req.session.passport.user.enduser_id,function(err,result){
        if(err){
            res.send(err);
        }else{
            res.send(result);
        }
    });
});


router.get('/business_index', function(req, res) {
    if(req.session.passport.user !== undefined){
        var settings = {};
		settings.user = {};
		settings.user.loginaccount = req.session.passport.user.loginaccount;	
		settings.user.displayname = req.session.passport.user.displayname;	
		settings.user.role_id = req.session.passport.user.role_id;	
        settings.user.is_business = req.session.passport.user.is_business;
        settings.user.balance = req.session.passport.user.balance;	
		settings.session_message = req.session.session_message;	
        res.render('admin/index', {	
            bodypage: 'business_index',
            settings: settings,
            menus  :   req.menu,
            pathname : req.originalUrl,
            domainname:req.domainname,
            balance:null,
            error:null,
            status:null
        });
    }else{
        res.redirect('/admin/login');
    } 
});


router.get('/editBusiness/:merchant_id',function(req,res){
    //get merchant data
    
    if(req.session.passport.user !== undefined){
        var settings = {};
		settings.user = {};
		settings.user.loginaccount = req.session.passport.user.loginaccount;	
		settings.user.displayname = req.session.passport.user.displayname;	
		settings.user.role_id = req.session.passport.user.role_id;	
        settings.user.is_business = req.session.passport.user.is_business;
        settings.user.balance = req.session.passport.user.balance;	
		settings.session_message = req.session.session_message;	
        var merchant_id = req.params.merchant_id;
            BusinessModel.getMerchantDataByMerchantID(merchant_id,function(error,merchant){
                if(error){
                    res.render('admin/index', {	
                        bodypage: 'edit_business',
                        settings: settings,
                        menus  :   req.menu,
                        pathname : req.originalUrl,
                        domainname:req.domainname,
                        balance:null,
                        error:null,
                        status:null,
                        merchant : null
                    });
                }else{
                    HelperModel.get_api(callback_link,function(link){
                        res.render('admin/index', {	
                            bodypage: 'edit_business',
                            settings: settings,
                            menus  :   req.menu,
                            pathname : req.originalUrl,
                            domainname:req.domainname,
                            balance:null,
                            error:null,
                            status:null,
                            merchant : merchant,
                            callback_link:link
                        });
                    });
                    
                }
            });	
        
    }else{
        res.redirect('/admin/login');
    } 
});



router.get('/ownbusiness/:merchant_id',function(req,res){
    //get merchant data
    
    if(req.session.passport.user !== undefined){
        var settings = {};
		settings.user = {};
		settings.user.loginaccount = req.session.passport.user.loginaccount;	
		settings.user.displayname = req.session.passport.user.displayname;	
		settings.user.role_id = req.session.passport.user.role_id;	
        settings.user.is_business = req.session.passport.user.is_business;
        settings.user.balance = req.session.passport.user.balance;	
		settings.session_message = req.session.session_message;	
        var merchant_id = req.params.merchant_id;
            BusinessModel.getMerchantDataByMerchantID(merchant_id,function(error,merchant){
                if(error){
                    res.render('admin/index', {	
                        bodypage: 'ownbusiness',
                        settings: settings,
                        menus  :   req.menu,
                        pathname : req.originalUrl,
                        domainname:req.domainname,
                        balance:null,
                        error:null,
                        status:null,
                        merchant : null
                    });
                }else{
                    res.render('admin/index', {	
                        bodypage: 'ownbusiness',
                        settings: settings,
                        menus  :   req.menu,
                        pathname : req.originalUrl,
                        domainname:req.domainname,
                        balance:null,
                        error:null,
                        status:null,
                        merchant : merchant
                    });
                }
            });	
        
    }else{
        res.redirect('/admin/login');
    } 
});


router.post('/deactivemerchant',function(req,res){
  
    BusinessModel.deactivemerchant(req.body.merchant_v_id,function(err,result){
        if(err){
            res.send(err);
        }else{
            res.send(result);
        }
    });
});

router.post('/activemerchant',function(req,res){
  
    BusinessModel.activemerchant(req.body.merchant_v_id,function(err,result){
        if(err){
            res.send(err);
        }else{
            res.send(result);
        }
    });
});


module.exports = router;
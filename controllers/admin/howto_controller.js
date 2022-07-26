'use strict';
var express = require('express');
var router = express.Router();


router.get('/howto_index', function(req, res) {
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
            bodypage: 'howto_index',
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

module.exports = router;
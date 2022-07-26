'use strict';
var express = require('express');
var router = express.Router();
var MenuModel = require('../models/menu_model');
const domainname = require('../helpers/config').domainname;
//var session;

router.use("/*", function(req, res, next){
	
	var params = req.originalUrl.split('/');
	//admin
	//frontend

		if(params.length > 1)
		{
		
			if(params[1].indexOf("?")> 0){
				next();
			}else{
				if(params[1].toLowerCase() == "admin"){
					switch(params[2].toLowerCase())
					{			
						
						case "login" :
							next();
							break;
							
						case "logout" :
							next();
							break;
							
							
						case "signup" :
							next();
							break;
						case "account_signup" :
							next();
							break;
					
						case "emaillogin" :
							next();
							break;
						case "facebook_login_success" :
							next();
							break;

						

						case "verify" :
								next();
								break;
							
						default :
							verify(req, res, next);
					}
				}else{
					//frontend
					next_frontend(req, res, next);
				
				}
				
			}
			
		}
		else
		{
			verify(req, res, next);
		}
	
});


function next_frontend(req,res,next){
	req.domainname = domainname;
	next();
	return;
}

function verify(req, res, next) {
	
	console.log("req.session.passport.user.enduser_id");
	console.log(req.session.passport);
	 // session = req.session;
	
	var params = req.originalUrl.split('/');
	params.shift();
	
	var checkpublic = '/'+params[0]; //nodemodule_forclient
	var controller = '/'+params[0]+'/'+params[1]; //nodemodule_forclient
	params = '/' + params.join('/');
	//params.shift();
	
	if(req.session.passport){
		if(req.session.passport.user == undefined || !req.session.passport.user)
		{
			console.log("redirect to login from auth with passport user not found");
			res.redirect("/admin/login");
			
			
		}
		else
		{
			var userdata = req.session.passport.user;
			req.domainname = domainname;	
			MenuModel.getAllMenus(userdata.enduser_id,function(err,result){
				if(err){
					console.log("redirect to login with menus error");
					res.redirect("/admin/login");
					return;
				}else{
					var exist = result.filter(
						function(result){ return result.controller == controller || checkpublic == '/public' || checkpublic == '/nodemodule_forclient'}
					);
					
					console.log("controller");
					console.log(controller);
					
					if(exist.length>0){

						req.menu = result;
						console.log("in auth, pass for session");
						//	console.log(params);
					
						next();
						return;
					}else{
						console.log("permission denied");
						//res.redirect("/admin/login?auth=denied");
						res.redirect("/admin/login");
						
						
					}
					

				}
			});
		}
	}else{
		
		//console.log("redirect to login from auth");
		req.session.customerror = 'failed';
		//console.log(req.session.customerror);
		res.redirect("/admin/login");
		
	}
	
}

module.exports = router;
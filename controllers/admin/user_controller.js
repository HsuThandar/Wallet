'use strict';
var express = require('express');
var router = express.Router();
const UserModel = require('../../models/user_model');
const WalletModel = require('../../models/mmpay_wallet_model');
const Helper = require('../../models/helper_model');
const Funds_amount_for_business_acc = require('../../helpers/config').api.Funds_amount_for_business_acc;

router.get('/welcome', function(req, res) {
   console.log("welcome page loaded.");
   console.log(req.session.passport.user);
	if(req.session.passport.user !== undefined){
		console.log("user exist");
		var settings = {};
		settings.user = {};
		settings.user.loginaccount = req.session.passport.user.loginaccount;	
		settings.user.displayname = req.session.passport.user.displayname;	
		settings.user.role_id = req.session.passport.user.role_id;	
		settings.user.is_business = req.session.passport.user.is_business;	
		settings.user.balance = req.session.passport.user.balance;
		
		settings.session_message = req.session.session_message;	
		req.session.session_message = null; 
		var balance;
		WalletModel.getWalletDataByEndUserID(req.session.passport.user.enduser_id,function(err,result){
			if(err){
				res.render('admin/index', {	
					bodypage: 'welcome',
					settings: settings,
					menus  :   req.menu,
					pathname : req.originalUrl,
					domainname:req.domainname,
					balance : null,
					error:null,
					status:null
				});
			}else{
				balance =	result.length>0 ? result[0].balance : 0;
				settings.user.balance = result.length>0 ? result[0].balance : 0
				req.session.passport.user.balance = balance;
				res.render('admin/index', {	
					bodypage: 'welcome',
					settings: settings,
					menus  :   req.menu,
					pathname : req.originalUrl,
					domainname:req.domainname,
					balance : balance,
					error:null,
					status:null
				});
			}
			
		});
			
	}else{
		res.redirect('/admin/login');
	} 
});

router.get('/logout', function(req, res) {
  req.session.destroy(function(err){
		if(err){
			console.log(err);
		}
		else
		{
			res.redirect('/admin/login');
		}
	});
});



router.post('/saveuser', function(req, res) {
	req.body.enduser_id = req.session.passport.user.enduser_id;
    UserModel.saveuser(req.body,function(err,result){
        if(err){
            res.send({status:500,text:"Saving Failed"})
        }else{
            res.send({status:200,text:"succsss",data:result});
        }
    });
});

router.post('/deleteuser', function(req, res) {
    UserModel.deleteuser(req.session.passport.user.enduser_id,function(err,result){
        if(err){
            res.send({status:500,text:"Deleteing Failed"})
        }else{
            res.send({status:200,text:"succsss",data:result});
        }
    });
});



router.post('/getAdminProfilePageByID',function(req,res){
	UserModel.getUserDataByID(req.session.passport.user.enduser_id,function(err,result){
		if(err){
			res.send(err);
		}else{
			res.render('admin/adminProfile',{
				admin:result[0],
				domainname:req.domainname,
			});
		}
	});
});

router.post('/getBusinessRegisterForm',function(req,res){
	UserModel.getUserDataByID(req.session.passport.user.enduser_id,function(err,result){
		if(err){
			res.send({status:500,text:"User Error!",data:err});
		}else{
			//Funds_amount_for_business_acc
			WalletModel.getWalletDataByEndUserID(req.session.passport.user.enduser_id,function(nobalance,balance){
				if(nobalance){
					res.send({status:500,text:"Fund Error!",data:nobalance});
				}else{
					if(balance.length > 0 && balance[0].balance > Funds_amount_for_business_acc){
						UserModel.getMerchantDataByEnduserID(req.session.passport.user.enduser_id,function(error,merchant){
							if(error){
								res.send({status:500,text:"Merchant Error!",data:error});
							}else{
								
								res.render('admin/businessRegisterForm',{
									admin:result[0],
									domainname:req.domainname,
									merchant : merchant.length > 0 ? merchant[0] : null
								});
							}
						});
					}else{
						res.send({status:500,text:"Fund not enough! <br> Fund must be more than " + Funds_amount_for_business_acc +" kyats.",data:balance});
					}
				}
			});
			
			
		}
	});
});



router.post('/savemerchant', function(req, res) {
//to do: check callback url exists
	req.body.enduser_id = req.session.passport.user.enduser_id;
	if(req.body.merchant_v_id){
		UserModel.updatemerchant(req.body,function(err,result){
			if(err){
				res.send({status:500,text:"Saving Failed. Merchant Data must be unique."});
			}else{
				//to do: update passport session
				//settings.user.is_business = 1;
				console.log(req.session.passport);
				console.log(req.settings);
				req.session.passport.user.is_business = 1 ;
				res.send({status:200,text:"succsss",data:result});
			}
		});

	}else{
		delete req.body.merchant_v_id;
		UserModel.savemerchant(req.body,function(err,result){
			if(err){
				res.send({status:500,text:"Saving Failed. Merchant Data must be unique."});
			}else{
				//to do: update passport session
				console.log(req.session.passport);
				console.log(req.settings);
				req.session.passport.user.is_business = 1 ;
				res.send({status:200,text:"succsss",data:result});
			}
		});
	}
	/*
	Helper.checkdomain(req.body.merchant_domainurl,function(notfound,found){
		if(notfound){
			console.log("notfound");
			res.send({status:500,text:"Saving Failed. Merchant Domain doesn't exist."});
		}else{
			console.log("found");
			console.log(req.body.merchant_v_id);
			
		}
	});
    */
});



router.get('/details',function(req,res){
	

	if(req.session.passport.user !== undefined){
		var settings = {};
		settings.user = {};
		settings.user.loginaccount = req.session.passport.user.loginaccount;	
		settings.user.displayname = req.session.passport.user.displayname;	
		settings.user.role_id = req.session.passport.user.role_id;	
		settings.user.is_business = req.session.passport.user.is_business;
		settings.user.balance = req.session.passport.user.balance;	
		settings.session_message = req.session.session_message;	
		WalletModel.getWalletDataByEndUserID(req.session.passport.user.enduser_id,function(NOBALANCE,BALANCE){
			if(NOBALANCE){
				 
				res.render('admin/index', {	
					bodypage: 'welcome',
					settings: settings,
					menus  :   req.menu,
					pathname : req.originalUrl,
					domainname:req.domainname,
					balance:null,
					error:null,
					status:null
				});
			}else{
				UserModel.getUserDataByID(req.session.passport.user.enduser_id,function(NOUSER,USER){
					 ;
					if(NOUSER){
						res.render('admin/index', {	
							bodypage: 'userdetails',
							settings: settings,
							menus  :   req.menu,
							pathname : req.originalUrl,
							domainname:req.domainname,
							balance:	BALANCE.length>0 ? BALANCE[0].balance : 0,
							error:null,
							status:null,
							admin:null,
						});
						
					}else{
						res.render('admin/index', {	
							bodypage: 'userdetails',
							settings: settings,
							menus  :   req.menu,
							pathname : req.originalUrl,
							domainname:req.domainname,
							balance:	BALANCE.length>0 ? BALANCE[0].balance : 0,
							error:null,
							status:null,
							admin:USER[0],
						});
						
					}
				});
			}
		});
			
	}else{
		res.redirect('/admin/login');
	} 
});

router.post('/checkUserAlreadyRegister', function(req, res) {
	UserModel.checkUserAlreadyRegister(req.body.loginaccount,function(err,result){
		if(err){
			res.send({status:500,text:"System Error!"});
		}else{
			if(result.length > 0){
				res.send({status:200,text:"Correct"});
			}else{
				res.send({status:500,text:"User not found!"});
			}
		}
	});
});


router.post('/userQRCode', function(req, res) {
	if(req.session.passport.user !== undefined){
		var settings = {};
		settings.user = {};
		settings.user.loginaccount = req.session.passport.user.loginaccount;	
		settings.user.displayname = req.session.passport.user.displayname;	
		settings.user.role_id = req.session.passport.user.role_id;	
		settings.user.is_business = req.session.passport.user.is_business;
		settings.user.balance = req.session.passport.user.balance;	
		settings.session_message = req.session.session_message;	
		UserModel.getUserDataByID(req.session.passport.user.enduser_id,function(err,result){
			if(err){
				res.send({status:500,data:err});
			}else{
				
				
				var data = result[0].loginaccount + result[0].signup_date ; 
				
				var QRCode = require('qrcode');  

				QRCode.toDataURL(data)
					.then(url => {
						res.send({status:200,data:url});
					})
					.catch(err => {
						console.log("QRcode Error");
						console.log(err);
						res.send({status:500,data:err});
					});	
			}
		});
		
	}else{
		res.redirect('/admin/login');
	}

	

});

module.exports = router;
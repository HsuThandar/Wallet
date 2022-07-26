'use strict';
var express = require('express');
var router = express.Router();
var WalletModel = require('../../models/mmpay_wallet_model');
var serviceModel = require('../../models/service_model');
var BankingModel = require('../../models/banking_model');

router.post('/getWalletDataByEndUserID',function(req,res){
	
	WalletModel.getWalletDataByEndUserID(req.session.passport.user.enduser_id,function(err,result){
		if(err){
			res.send(err);
		}else{
			res.send(null,result);
		}
	});
});




router.post('/get_updateMMPayBalance_form',function(req,res){
	WalletModel.getWalletDataByEndUserID(req.session.passport.user.enduser_id,function(err,result){
		if(err){
			res.send({status:500,text:Error,data:err});
		}else{
		   

		   BankingModel.getAllLinkedAccount_forenduser(req.session.passport.user.enduser_id,function(error,service){
			   if(error){
					res.render('admin/update_mmpaybalance',{
						mmpaybalance:result[0],
						domainname:req.domainname,
						bank_service:null
					});
			   }else{
					res.render('admin/update_mmpaybalance',{
						mmpaybalance:result[0],
						domainname:req.domainname,
						bank_service:service
					});
			   }
		   });
			
		}
	});
});

router.post('/redirecttoRelevantBank',function(req,res){
   
    const service_id = req.body.service_id;
	//kbz,cb,aya,master,visa
	res.render('admin/connectwithBanking',{
		
		domainname:req.domainname,
		enduser_id:req.session.passport.user.enduser_id,
		loginaccount:req.body.loginaccount,
		service_id:req.body.service_id,
	});
});


module.exports = router;
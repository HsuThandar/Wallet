'use strict';
var express = require('express');
var router = express.Router();
var TransactionModel = require('../../models/transaction_log_model');
var mme_tran_log_model = require('../../models/mme_tran_log_model');
var mm_ser_tran_log_model = require('../../models/mm_ser_tran_log_model');
var mer_tran_log_model = require('../../models/mer_tran_log_model');

router.get('/getAlltransactionlogList_foreachuser',function(req,res){
    
    mme_tran_log_model.getAlltransactionlogList_foreachuser(req.query,req.session.passport.user.enduser_id,function(err,result){
        if(err){
            res.send(err);
        }else{
            res.send(result);
        }
    });
});
router.post('/downloadtransaction',function(req,res){
    var obj = req.body;
    obj.enduser_id = req.session.passport.user.enduser_id;
    mme_tran_log_model.gettransactionlist_byenduserid(obj,function(err,result){
        if(err){
            res.send(err);
        }else{
            res.send(result);
        }
    });
});

router.post('/downloadtransaction_formerchant',function(req,res){
    var obj = req.body;
  
    mer_tran_log_model.gettransactionlist_byMerchant_id(obj,function(err,result){
        if(err){
            res.send(err);
        }else{
            res.send(result);
        }
    });
});


router.get('/getAlltransactionlogList_foreachMerchant',function(req,res){
    
    mer_tran_log_model.getAlltransactionlogList_foreachMerchant(req.query,req.query.merchant_id,function(err,result){
        if(err){
            res.send(err);
        }else{
            res.send(result);
        }
    });
});


router.post('/transactiondetail_forenduser',function(req,res){
  
    mme_tran_log_model.transactiondetails_forenduser(req.body.transaction_id,function(err,result){
        if(err){
            res.send(err);
        }else{
            console.log(result);
            res.render('admin/transactiondetails_forenduser',{
				transaction:result
			});
        }
    });
});


router.post('/transactiondetail_formerchant',function(req,res){
  
    mer_tran_log_model.transactiondetail_formerchant(req.body.transaction_id,function(err,result){
        if(err){
            res.send(err);
        }else{
            console.log(result);
            res.render('admin/transactiondetail_formerchant',{
				transaction:result
			});
        }
    });
});



module.exports = router;
'use strict';
var express = require('express');
var router = express.Router();
var WalletModel = require('../../models/mmpay_wallet_model');
var commissionModel = require('../../models/commission_model');
var mme_tran_log_model = require('../../models/mme_tran_log_model');
var mm_ser_tran_log_model = require('../../models/mm_ser_tran_log_model');
var BusinessModel = require('../../models/business_model');
var BankingModel  = require('../../models/banking_model');
var ServiceModel  = require('../../models/service_model');
var API_Model = require('../../models/api_model');
const UserModel = require('../../models/user_model');

router.post('/callbackFrom_addFunds',function(req,res){
    //callbackFrom addFunds
//todo: send error status or successs status
console.log('here is from bank');
  
    var amount = req.body.amount;
    var enduser_id = req.session.passport.user.enduser_id;
    var service_id = req.body.service_id;
    var old_balance  = req.session.passport.user.balance;
    var new_balance = parseInt(old_balance) + parseInt(amount) ;
    
    var transaction_status_code_from_bank = 200;
    if(transaction_status_code_from_bank == 200){
    //insert mmpayenduser_transaction_log if transaction success
        //insert mmpay_service_tranaction_log
        var service_log = {};
        service_log.mm_service_tran_status = 'Completed';
        service_log.mm_service_tran_type = 'Transfer To';
        service_log.mm_service_tran_code = 200;
        service_log.mm_service_id = req.body.service_id;
        service_log.service_value = ''; //bank account name
        service_log.mmpay_enduser  = req.session.passport.user.enduser_id;
        //service_log.merchant_id = req.body.amount;
        service_log.amount = req.body.amount;
        service_log.mm_service_tran_log_v_id = Math.random().toString().slice(2);
        var enduser_log = {};
        enduser_log.mm_tran_status ='Completed';
        enduser_log.mm_tran_type = 'Add Funds';
        enduser_log.mm_tran_code = 200;
        enduser_log.record_subject = req.session.passport.user.enduser_id;
        enduser_log.service_id = req.body.service_id;
        enduser_log.old_balance = old_balance;
        enduser_log.new_balance = new_balance;
        //enduser_log.record_object = req.body.record_object;
        enduser_log.amount = req.body.amount;
        enduser_log.mm_tran_log_v_id = Math.random().toString().slice(2);
        mm_ser_tran_log_model.insertServiceTransaction(service_log,function(error,transaction){
    
            if(error){
                res.redirect('/admin/user/welcome');
            }else{
                mme_tran_log_model.insertMMPayUserTransaction(enduser_log,function(error,transaction){
    
                    if(error){
                        res.redirect('/admin/user/welcome');
                    }else{
                        WalletModel.updateBalance(amount,enduser_id,"add",function(err,balance){
                            res.redirect('/admin/user/welcome');
                          
                        });
                        
                    }
                            
                }); 
                
            }
                    
        }); 
        
        
    }else{
        res.redirect('/admin/user/welcome');
    }
  
    
	
});


router.get('/bankaccountinfo',function(req,res){
    if(req.session.passport.user !== undefined){
      
        var settings = {};
		settings.user = {};
		settings.user.loginaccount = req.session.passport.user.loginaccount;	
		settings.user.displayname = req.session.passport.user.displayname;	
		settings.user.role_id = req.session.passport.user.role_id;	
        settings.user.is_business = req.session.passport.user.is_business;
        settings.user.balance = req.session.passport.user.balance;	
		settings.session_message = req.session.session_message;	
		
        //settings.user = req.session.passport.user;
        BankingModel.getLinkedBankCount(req.session.passport.user.enduser_id,function(error,noofbank){
            var result;
            if(error){
                result = null;
            }else{
                result = noofbank;
            }
             ;
            res.render('admin/index', {	
                bodypage: 'bankaccountinfo',
                settings: settings,
                menus  :   req.menu,
                pathname : req.originalUrl,
                domainname:req.domainname,
                balance:null,
                error:null,
                status:null,
                noofbank : result
            });
        });	
        
    }else{
        res.redirect('/admin/login');
    } 
});


router.get('/addnewlinkedbankaccount',function(req,res){
    if(req.session.passport.user !== undefined){
		var settings = {};
      
		settings.user = {};
		settings.user.loginaccount = req.session.passport.user.loginaccount;	
		settings.user.displayname = req.session.passport.user.displayname;	
		settings.user.role_id = req.session.passport.user.role_id;	
		settings.user.is_business = req.session.passport.user.is_business;	
        settings.session_message = req.session.session_message;	
        
        BankingModel.getAllBankService(function(error,banking){
            var result;
            if(error){
                result = null;
            }else{
                result = banking;
            }
             ;
            res.render('admin/index', {	
                bodypage: 'add_newbankaccount',
                settings: settings,
                menus  :   req.menu,
                pathname : req.originalUrl,
                domainname:req.domainname,
                balance:null,
                error:null,
                status:null,
                bank_service : banking
            });
        });	
        
    }else{
        res.redirect('/admin/login');
    } 
});

router.get('/edit_linkedbankaccount/:linkedbank_id',function(req,res){
    console.log();
    var linkedbank_id = req.params.linkedbank_id;
    if(req.session.passport.user !== undefined){
        var settings = {};
		settings.user = {};
		settings.user.loginaccount = req.session.passport.user.loginaccount;	
		settings.user.displayname = req.session.passport.user.displayname;	
		settings.user.role_id = req.session.passport.user.role_id;	
        settings.user.is_business = req.session.passport.user.is_business;
        settings.user.balance = req.session.passport.user.balance;	
		settings.session_message = req.session.session_message;	
        BankingModel.getAllBankService(function(error,banking){
            var result;
            if(error){
                result = null;
            }else{
                result = banking;
            }
            BankingModel.getLinkedBankDataByLinkedBank_id(linkedbank_id,function(nolinkedbank,linkedbank){
                var linkedbank_data;
                if(nolinkedbank){
                    linkedbank_data = null;
                }else{
                    linkedbank_data = linkedbank;
                }
                 ;
                res.render('admin/index', {	
                    bodypage: 'edit_bankaccount',
                    settings: settings,
                    menus  :   req.menu,
                    pathname : req.originalUrl,
                    domainname:req.domainname,
                    balance:null,
                    error:null,
                    status:null,
                    bank_service : banking,
                    linkedbank_data:linkedbank_data
                });
            });
            
        });	
        
    }else{
        res.redirect('/admin/login');
    } 
});



router.post('/savenewbankaccount_forenduser',function(req,res){
    var data = {};
    data.enduser_id = req.session.passport.user.enduser_id;
   // data.subject = req.session.passport.user.enduser_id;
    data.service_id = req.body.service_id;
   // data.object = req.body.service_id;
    data.account_name = req.body.bankaccountname;
    data.account_number = req.body.bankaccountnumber;

    
    BankingModel.savenewbankaccount_forenduser(data,function(error,result){
        res.redirect('/admin/banking/bankaccountinfo');
    });

});


router.get('/getAllLinkedAccountList_forenduser',function(req,res){
    
    BankingModel.getAllLinkedAccountList_forenduser(req.query,req.session.passport.user.enduser_id,function(err,result){
        if(err){
            res.send(err);
        }else{
            res.send(result);
        }
    });
});


router.get('/getAllLinkedAccount_forenduser',function(req,res){
    
    BankingModel.getAllLinkedAccount_forenduser(req.session.passport.user.enduser_id,function(err,result){
        if(err){
            res.send(err);
        }else{
            res.send(result);
        }
    });
});



router.post('/deactiveLinkedBankBtn',function(req,res){
  
    BankingModel.deactiveLinkedBankBtn(req.body.linkedbank_id,function(err,result){
        if(err){
            res.send(err);
        }else{
            res.send(result);
        }
    });
});

router.post('/activeLinkedBankBtn',function(req,res){
  
    BankingModel.activeLinkedBankBtn(req.body.linkedbank_id,function(err,result){
        if(err){
            res.send(err);
        }else{
            res.send(result);
        }
    });
});


router.get('/transfer',function(req,res){
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
            bodypage: 'transfermoney',
            settings: settings,
            menus  :   req.menu,
            pathname : req.originalUrl,
            domainname:req.domainname,
            balance:null,
            error:null,
            status:null,
            commissions_fee : require('../../helpers/config').api.commission_fee
        });
    }else{
        res.redirect('/admin/login');
    } 
});

router.post('/internaltransfer',function(req,res){
    BankingModel.internaltransfer(req,function(err,result){
        if(err){
            req.session.session_message = err.text;
            res.redirect('/admin/user/welcome');
           
        }else{
            req.session.session_message = result.text;
            res.redirect('/admin/user/welcome');
        }
    });
});
router.post('/old_internaltransfer',function(req,res){

    //sender  - deduct
    //to_recipient - add
    var total_amount = parseInt(req.body.amount);
    //to do: calculate commission fee
    var commission_fee = require('../../helpers/config').api.commission_fee;
    var commission_value = total_amount * (commission_fee / 100);
    var amount_recipient_got = total_amount;
    var amount_sender_wasdeducted = total_amount +parseInt(commission_value);
    //todo: save mmPay transaction log
    /**
     * id,merchant transaction log id, enduser transaction log id, service transactiong log id
     * commission fee, 
     *  
     */
    var to_recipient = req.body.to_recipient;
    var old_balance  = req.session.passport.user.balance;
    var new_balance = old_balance - amount_sender_wasdeducted;
    
    var AboutUser = req.session.passport.user; // sender
        if(AboutUser.balance <= amount_sender_wasdeducted ){
           req.send({status:500,text:"Funds not enough!"});
        }else{
            //to_recipient - add
            UserModel.checkUserAlreadyRegister(to_recipient,function(notuser1,Recipient){
                if(notuser1){
                    res.redirect('/admin/user/welcome');
                }else{
                    console.log(Recipient);
                    if(Recipient.length < 1){
                        res.redirect('/admin/user/welcome');
                    }else{
                          //deduct balance
            API_Model.updateBalance(amount_sender_wasdeducted,AboutUser.enduser_id,"deduct",function(noBalance,Balance){
                if(noBalance){
                    data.transaction_status = 500;
                    data.transaction_text = "Deductin Balance Error.";
                    output();
                }else{
                    //save transaction log
                    //From who
                    var enduser_log = {};
                    enduser_log.old_balance = old_balance;
                    enduser_log.new_balance = new_balance;
                    enduser_log.mm_tran_status ='Completed';
                    enduser_log.mm_tran_type = 'Transfer To';
                    enduser_log.mm_tran_code = 200;
                    enduser_log.record_subject = AboutUser.enduser_id;
                    enduser_log.record_object = Recipient[0].enduser_id;
                    enduser_log.amount = amount_sender_wasdeducted;
                    enduser_log.mm_tran_log_v_id = Math.random().toString().slice(2);
                    mme_tran_log_model.insertMMPayUserTransaction(enduser_log,function(notransaction,transaction){
                
                        if(notransaction){
                            res.redirect('/admin/user/welcome');
                        }else{
                            API_Model.enduser_lastupdate_by_enduser_id(AboutUser.enduser_id,function(nouserupdate,userupdate){
                                //type of result
                                commissionModel.insertcommissionTransaction(commission_log,function(failed_com,success_com){
 //deduct balance
                            API_Model.updateBalance(amount_recipient_got,Recipient[0].enduser_id,"added",function(noBalance,Balance){
                               if(noBalance){
                                   res.redirect('/admin/user/welcome');
                               }else{
                                   //save transaction log
                                   //to who
                                    var to_enduser_log = {};
                                    var Recipient_old_balance  = Recipient[0].balance;
                                    var Recipient_new_balance = Recipient_old_balance + parseInt(amount_recipient_got);
                                    to_enduser_log.old_balance = Recipient_old_balance;
                                    to_enduser_log.new_balance = Recipient_new_balance;
                                    to_enduser_log.mm_tran_status ='Completed';
                                    to_enduser_log.mm_tran_type = 'Transfer From';
                                    to_enduser_log.mm_tran_code = 200;
                                    to_enduser_log.record_object = AboutUser.enduser_id;
                                    to_enduser_log.record_subject = Recipient[0].enduser_id;
                                    to_enduser_log.amount = amount_recipient_got;
                                    to_enduser_log.mm_tran_log_v_id = Math.random().toString().slice(2);
                                   mme_tran_log_model.insertMMPayUserTransaction(to_enduser_log,function(notransaction,transaction){
    
                                    if(notransaction){
                                        res.redirect('/admin/user/welcome');
                                    }else{
                                        API_Model.enduser_lastupdate_by_enduser_id(Recipient[0].enduser_id,function(nouserupdate,userupdate){
                                            res.redirect('/admin/user/welcome');
                                        });
                                    }
                                });
                                   
                                   
                                  
                               }
                           });
                                });
                           
               
                           });
                        }
                    });
           
                    
                }
            });
                    }
          
                }
            });
            
            
        }
    
	
 
});


router.get('/withdrawal',function(req,res){
    if(req.session.passport.user !== undefined){
        var settings = {};
		settings.user = {};
		settings.user.loginaccount = req.session.passport.user.loginaccount;	
		settings.user.displayname = req.session.passport.user.displayname;	
		settings.user.role_id = req.session.passport.user.role_id;	
        settings.user.is_business = req.session.passport.user.is_business;
        settings.user.balance = req.session.passport.user.balance;	
		settings.session_message = req.session.session_message;	
        ServiceModel.getAllService(function(error,Service){
            var result;
            if(error){
                result = null;
            }else{
                result = {};
                result.banking = [];
                result.operator = [];
                result.ewallet = [];
                for(var i=0; i< Service.length; i++ ){
                    if(Service[i].payment_menthod_type == 'banking'){
                        result.banking.push(Service[i]);
                    }else if(Service[i].payment_menthod_type == 'operator'){
                        result.operator.push(Service[i]);
                
                    }else if(Service[i].payment_menthod_type == 'e-wallet'){
                        result.ewallet.push(Service[i]);
                    }

                }
                 ;
                res.render('admin/index', {	
                    bodypage: 'withdrawmoney',
                    settings: settings,
                    menus  :   req.menu,
                    pathname : req.originalUrl,
                    domainname:req.domainname,
                    balance:null,
                    error:null,
                    status:null,
                    service:result,
                    commissions_fee : require('../../helpers/config').api.commission_fee
                });
            }
        });
        
    }else{
        res.redirect('/admin/login');
    } 
});


router.post('/withdrawByService', function(req, res) {
  
    BankingModel.withdrawByService(req,function(err,result){
        if(err){
            console.log(err);
            req.session.session_message = err.text;
            res.redirect('/admin/user/welcome');
           
        }else{
            req.session.session_message = result.text;
            res.redirect('/admin/user/welcome');
        }
    });
    
    
});


module.exports = router;
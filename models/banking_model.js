
var mysql = require('../helpers/database');
var HelperModel = require('./helper_model');

var moment= require('moment');
var WalletModel = require('./mmpay_wallet_model');
var commissionModel = require('./commission_model');
var mme_tran_log_model = require('./mme_tran_log_model');
var mm_ser_tran_log_model = require('./mm_ser_tran_log_model');
var BusinessModel = require('./business_model');
var BankingModel = require('./banking_model');
var API_Model = require('./api_model');
const UserModel = require('./user_model');

exports.getAllLinkedAccountList_forenduser = function(querystring,enduser_id,cb){
	 
    var aColumns = ["linkedbank_id","ps.service_name","account_name","account_number","lb.is_deleted"];   
   /* Indexed column (used for fast and accurate table cardinality)*/
   var sIndexColumn = "linkedbank_id";
 
  /* DB table to use */
  var sTable = "enduser_linkedbank lb";
  //Paging
  var sLimit = "";
  if (querystring.iDisplayStart != 'null' && querystring.iDisplayLength != '-1' )
  {
	  sLimit = "LIMIT "+querystring.iDisplayStart  +", "+
	  querystring.iDisplayLength ;
  }
 
  //Ordering  
  if (querystring.iSortCol_0 != 'null' )
  {
	  var sOrder = "ORDER BY  ";
 
	  for ( var i=0 ; i< parseInt(querystring.iSortingCols) ; i++ )
	  {			
		  if ( querystring["bSortable_"+parseInt(querystring["iSortCol_"+i])] == "true" )
		  {
			  sOrder += aColumns[ parseInt(querystring["iSortCol_" +i])]+" "+querystring["sSortDir_"+i]  +" , ";
		  }
	  }
	  
	  sOrder = sOrder.substring(0, sOrder.length-2);
	  if ( sOrder == "ORDER BY" )
	  {
		  sOrder = "";
	  }
  }
  
  // search		
  var sWhere = " where  lb.enduser_id =  " + enduser_id + " "; 
  if ( querystring["sSearch"] != "" )
  {
	  sWhere += " AND (";
	  for ( var k=0 ; k<aColumns.length ; k++ )
	  {
		  var search_str = querystring['sSearch'].replace(/'/g, "\\'");
		  sWhere += aColumns[k]+" LIKE '%"+ search_str +"%' OR ";
	  }
	  sWhere = sWhere.substring(0 , sWhere.length-3 );
	  sWhere += ')';
  }	
 
  sQuery = "SELECT SQL_CALC_FOUND_ROWS "+aColumns.join()+" FROM "+ sTable + " LEFT JOIN `payment_service` ps ON lb.service_id = ps.service_id   " + sWhere+ sOrder+ sLimit;
  console.log(sQuery);
  mysql.getConnection(function(err, connection){	 
	  if(err){
		  cb({status:500,text:"mysql getConnection Error",data:err});
	  }else{
		  connection.query(sQuery , function(err, results) {
			  if (err) {
				  cb({status:500,text:"mysql query Error",data:err});
				}else {
					connection.query("SELECT FOUND_ROWS() as num_row" , function(err, myres) {
					  if (err) {
						  cb(err, null);
					  }else {
						  var iFilteredTotal = myres[0].num_row;					
						  var rResult = results;    
						  var total_query = "SELECT COUNT("+sIndexColumn+") as total_record FROM "+sTable;
						  connection.query(total_query, function(err, result) {
							  if (err) {
								  cb(err, null);
							  }else {
								  var iTotal = result[0].total_record;							
								  var output = {};
								  output["sEcho"] = querystring.sEcho;
								  output["iTotalRecords"] = iTotal;
								  output["iTotalDisplayRecords"] = iFilteredTotal;
								  output["aaData"] = [];
								  var count = 0;
								  for (var k in rResult)  
								  {
									
								
           
								   output['aaData'][count] =[rResult[k].linkedbank_id,rResult[k].service_name,rResult[k].account_name,rResult[k].account_number,rResult[k].is_deleted];
								   count++;
								  }
								  var json_data = JSON.stringify(output);    
								  cb(null, json_data);
							  }
							  connection.release();
						 });							
					  }							  
				  });
				}		   
		  });	
	  }
			 
  }); 
 }
  
exports.getLinkedBankCount = function(enduser_id,callback){
	mysql.getConnection(function(err, connection){
		//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('SELECT COUNT(*) AS noofbank FROM `enduser_linkedbank` lb WHERE lb.enduser_id =  ? ;',[enduser_id], function(err, result){
			
			if(!err){			
                //console.log(result);
                callback(null,result[0].noofbank);
				
			}else{
				callback({status:500,text:"mysql query Error",data:err});
			
			}
			
		});console.log(i.sql);
		connection.release();
	}	
	
});
}
  
exports.getLinkedBankDataByLinkedBank_id = function(linkedbank_id,callback){
	mysql.getConnection(function(err, connection){
		//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('SELECT lb.*, ps.service_name FROM `enduser_linkedbank` lb LEFT JOIN `payment_service` ps ON lb.service_id = ps.service_id  WHERE lb.linkedbank_id  = ?;',[linkedbank_id], function(err, result){
			
			if(!err){			
                //console.log(result);
                if(result.length > 0){
					callback(null,result[0]);
			   }else{
				   callback({status:500,text:"no link account",data:err});
			   }
			  
				
			}else{
				callback({status:500,text:"mysql query Error",data:err});
			
			}
			
		});console.log(i.sql);
		connection.release();
	}	
	
});
}
  
  
exports.getAllLinkedAccount_forenduser = function(enduser_id,callback){
	mysql.getConnection(function(err, connection){
		//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('SELECT lb.service_id,ps.service_name,account_number FROM `enduser_linkedbank` lb LEFT JOIN `payment_service` ps ON lb.service_id = ps.service_id  WHERE lb.enduser_id  = ? and lb.is_deleted = 0;',[enduser_id], function(err, result){
			
			if(!err){			
                //console.log(result);
                if(result.length > 0){
					callback(null,result);
			   }else{
				   callback({status:500,text:"no link account",data:err});
			   }
			  
				
			}else{
				callback({status:500,text:"mysql query Error",data:err});
			
			}
			
		});console.log(i.sql);
		connection.release();
	}	
	
});
}
  
exports.getAllBankService = function(callback){
	mysql.getConnection(function(err, connection){
		//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('SELECT service_id,service_name FROM `payment_service`   WHERE `payment_menthod_type` = "banking";', function(err, result){
			
			if(!err){			
                //console.log(result);
                if(result.length > 0){
                     callback(null,result);
                }else{
                    callback({status:500,text:"no banks",data:err});
                }
               
				
			}else{
				callback({status:500,text:"mysql query Error",data:err});
			
			}
			
		});console.log(i.sql);
		connection.release();
	}	
	
});
}

exports.savenewbankaccount_forenduser = function(data,callback){
	data.registered_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
	data.lastupdated_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
	mysql.getConnection(function(err, connection){
		//console.log(err);
		if(err){
			callback({status:500,text:"mysql getConnection Error",data:err});
		}else{
			//console.log(userdata.email);
			var i = connection.query("INSERT INTO `enduser_linkedbank` SET ? ;",[data], function(err, result){
				
				if(!err){			
					callback(null,result);
					
				}else{
					callback({status:500,text:"mysql query Error",data:err});
				
				}
				
			});console.log(i.sql);
			connection.release();
		}	
		
	});
}


exports.activeLinkedBankBtn  = function(linkedbank_id,callback){	
	data.lastupdated_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
	mysql.getConnection(function(err, connection){
	//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('update enduser_linkedbank set is_deleted = 0 and lastupdated_date = now() where linkedbank_id = ?',[linkedbank_id], function(err, result){
			
			if(!err){	
				
					callback(null,{status:200,text:"Successfully updated!"});
					
				
			}else{
				
				callback({status:500,text:"no Business",data:err});
			
			}
			
		});console.log(i.sql);
		connection.release();
	}	

	});
}

exports.deactiveLinkedBankBtn  = function(linkedbank_id,callback){	
	mysql.getConnection(function(err, connection){
	//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('update enduser_linkedbank set is_deleted = 1 and lastupdated_date = now() where linkedbank_id = ?',[linkedbank_id], function(err, result){
			
			if(!err){	
				callback(null,{status:200,text:"Successfully updated!"});
				
			}else{
				
				callback({status:500,text:"no Business",data:err});
			
			}
			
		});console.log(i.sql);
		connection.release();
	}	

	});
}




exports.internaltransfer  = function(req,callback){
	
	var commission_fee = require('../helpers/config').api.commission_fee;

	
    //to_recipient - add
    var total_amount = parseInt(req.body.amount);
    //to do: calculate commission fee
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
			callback({status:500,text:"Funds not enough!"});
        }else{
            //to_recipient - add
            UserModel.checkUserAlreadyRegister(to_recipient,function(notuser1,Recipient){
                if(notuser1){
                   callback({status:500,text:'User not found!'});
                }else{
                   // console.log(Recipient);
                    if(Recipient.length < 1){
                        callback({status:500,text:'Recipient not found!'});
                    }else{

						mysql.getConnection(function(err, connection){
							//console.log(err);
							if(err){console.log(err);
								callback({status:500,text:"mysql getConnection Error",data:err});
							}else{
										
						
								connection.beginTransaction(function(err) {
									if (err) { console.log(err);
										callback({status:500,text:'Transaction Failed!'});
									}else{
										//1. updateBalance
										//2. insertMMPayUserTransaction
										//3. enduser_lastupdate_by_enduser_id
										//4. insertcommissionTransaction
										//5. updateBalance - recipient
										//6. insertMMPayUserTransaction - recipient 
										//7. enduser_lastupdate_by_enduser_id - recipient 

										//1. updateBalance
										//amount_sender_wasdeducted,AboutUser.enduser_id,"deduct"
										var sQuery_updateBalance = "update `mmpay_wallet` SET balance = balance - ? where enduser_id = ?";
										connection.query(sQuery_updateBalance, [amount_sender_wasdeducted,AboutUser.enduser_id], function(err, result) {
											if (err) { console.log(err);
												connection.rollback(function() {
													callback({status:500,text:'Transaction Failed!'});
												});
											}else{
												//2. insertMMPayUserTransaction
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
												enduser_log.mm_tran_date = moment(new Date).format('YYYY-MM-DD HH:mm:ss');
												var sQuery_insertMMPayUserTransaction = 'INSERT INTO mmpayuser_transaction_log SET ?';
												connection.query(sQuery_insertMMPayUserTransaction, enduser_log, function(err, result) {
													if (err) { console.log(err);
														connection.rollback(function() {
															callback({status:500,text:'Transaction Failed!'});
														});
													}else{
														//3. enduser_lastupdate_by_enduser_id
														
														var sQuery_enduser_lastupdate_by_enduser_id = "UPDATE mmpay_enduser SET `last_updateddate` = NOW() WHERE enduser_id = ? ;";
														connection.query(sQuery_enduser_lastupdate_by_enduser_id, [AboutUser.enduser_id], function(err, result) {
															if (err) { console.log(err);
																connection.rollback(function() {
																	callback({status:500,text:'Transaction Failed!'});
																});
															}else{

																//4. insertcommissionTransaction
																//5. updateBalance - recipient
																//amount_recipient_got,Recipient[0].enduser_id,"added"
																var sQuery_updateBalance_to = "update `mmpay_wallet` SET balance = balance + ? where enduser_id = ?";
																connection.query(sQuery_updateBalance_to, [amount_recipient_got,Recipient[0].enduser_id], function(err, result) {
																	if (err) { console.log(err);
																		connection.rollback(function() {
																			callback({status:500,text:'Transaction Failed!'});
																		});
																	}else{
																		//6. insertMMPayUserTransaction - recipient
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
																		to_enduser_log.mm_tran_date = moment(new Date).format('YYYY-MM-DD HH:mm:ss');
																		var sQuery_insertMMPayUserTransaction_to = 'INSERT INTO mmpayuser_transaction_log SET ?';
																		connection.query(sQuery_insertMMPayUserTransaction_to, enduser_log, function(err, result) {
																			if (err) { console.log(err);
																				connection.rollback(function() {
																					callback({status:500,text:'Transaction Failed!'});
																				});
																			}else{
																				//7. enduser_lastupdate_by_enduser_id  - recipient
																				
																				var sQuery_enduser_lastupdate_by_enduser_id_to = "UPDATE mmpay_enduser SET `last_updateddate` = NOW() WHERE enduser_id = ? ;";
																				connection.query(sQuery_enduser_lastupdate_by_enduser_id_to, [Recipient[0].enduser_id], function(err, result) {
																					if (err) { 
																						console.log(err);
																						connection.rollback(function() {
																							callback({status:500,text:'Transaction Failed!'});
																						});
																					}else{
																						connection.commit(function(err) {
																							if (err) { 
																								connection.rollback(function() {
																									console.log(err);
																									callback({status:500,text:'Transaction Failed!'});
																								});
																							}else{
																								console.log('success!');
																								callback(null,{status:200,text:'Transaction Success!'});
																							}
																							
																						});connection.release();
																					}
																				});
																			}
																		});
		
															}
														});
													}
												});

											
											}
										
										
										});
									}
									
								});
							}	
						
							});

                }
            });
                    }
          
                }
            });
             
            
		}
	}


/** ===================================================================== */
                          //deduct balance
            /* API_Model.updateBalance(amount_sender_wasdeducted,AboutUser.enduser_id,"deduct",function(noBalance,Balance){
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
                            
                        }else{
                            API_Model.enduser_lastupdate_by_enduser_id(AboutUser.enduser_id,function(nouserupdate,userupdate){
                                //type of result
                                commissionModel.insertcommissionTransaction(commission_log,function(failed_com,success_com){

                                });
                            //deduct balance
                            API_Model.updateBalance(amount_recipient_got,Recipient[0].enduser_id,"added",function(noBalance,Balance){
                               if(noBalance){
                                   
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
                                        
                                    }else{
                                        API_Model.enduser_lastupdate_by_enduser_id(Recipient[0].enduser_id,function(nouserupdate,userupdate){
                                            
                                        });
                                    }
                                });
                                   
                                   
                                  
                               }
                           });
               
                           });
                        }
                    });
           */
                    
exports.withdrawByService  = function(req,callback){
	
	var commission_fee = require('../helpers/config').api.commission_fee;
    var total_amount = parseInt(req.body.amount);
    var commission_value = total_amount * (commission_fee / 100);
    var amount_service_got = total_amount;
    var amount_sender_wasdeducted = total_amount + parseInt(commission_value);

    var old_balance  = req.session.passport.user.balance;
    var new_balance = old_balance - amount_sender_wasdeducted;
   
    var AboutUser = req.session.passport.user; // sender
	if(AboutUser.balance <= amount_sender_wasdeducted ){
		callback({status:500,text:"Funds not enough!"});
	}else{
		mysql.getConnection(function(err, connection){
			//console.log(err);
			if(err){console.log(err);
				callback({status:500,text:"mysql getConnection Error",data:err});
			}else{
						
		
				connection.beginTransaction(function(err) {
					if (err) { console.log(err);
						callback({status:500,text:'Transaction Failed!'});
					}else{
						
						//1. updateBalance
						//amount_sender_wasdeducted,AboutUser.enduser_id,"deduct"
						var sQuery_updateBalance = "update `mmpay_wallet` SET balance = balance - ? where enduser_id = ?";
						connection.query(sQuery_updateBalance, [amount_sender_wasdeducted,AboutUser.enduser_id], function(err, result) {
							if (err) { console.log(err);
								connection.rollback(function() {
									callback({status:500,text:'Transaction Failed!'});
								});
							}else{
								
								//4. insertcommissionTransaction
								//5.service transaction
								var service_type = req.body.type;
								var service_value;
								var service_id;
								console.log(req.body)
									if(service_type == 'mobile_operator'){
										service_value = req.body.phoneno;
										service_id = req.body.operator_name;
										const phone  = require('phone');
										var is_phone = phone(service_value);
										//todo: mobile integration
										if(is_phone.length<1){
											console.log(err);
											connection.rollback(function() {
												callback({status:500,text:'Invalid phone number!'});
											});
										}
									}else if(service_type == 'online_banking'){
											//todo: banking integration
										service_value = req.body.bankaccountno;
										service_id = req.body.bank_name;	
									}else if(service_type == 'e_wallet'){
										//todo: ewallet integration
										service_id = req.body.e_wallet_name;
										service_value = req.body.ewalletno;
									}
									console.log('success!',service_id);
									if(service_id){


									//2. insertMMPayUserTransaction
									//From who
									var enduser_log = {};
									enduser_log.old_balance = old_balance;
									enduser_log.new_balance = new_balance;
									enduser_log.mm_tran_status ='Completed';
									enduser_log.mm_tran_type = 'Transfer To';
									enduser_log.mm_tran_code = 200;
									enduser_log.record_subject = AboutUser.enduser_id;
									enduser_log.service_id = service_id;
									enduser_log.amount = amount_sender_wasdeducted;
									enduser_log.mm_tran_log_v_id = Math.random().toString().slice(2);
									enduser_log.mm_tran_date = moment(new Date).format('YYYY-MM-DD HH:mm:ss');
									var sQuery_insertMMPayUserTransaction = 'INSERT INTO mmpayuser_transaction_log SET ?';
									connection.query(sQuery_insertMMPayUserTransaction, enduser_log, function(err, result) {
										if (err) { console.log(err);
											connection.rollback(function() {
												callback({status:500,text:'Transaction Failed!'});
											});
										}else{
											//3. enduser_lastupdate_by_enduser_id
											
											var sQuery_enduser_lastupdate_by_enduser_id = "UPDATE mmpay_enduser SET `last_updateddate` = NOW() WHERE enduser_id = ? ;";
											connection.query(sQuery_enduser_lastupdate_by_enduser_id, [AboutUser.enduser_id], function(err, result) {
												if (err) { console.log(err);
													connection.rollback(function() {
														callback({status:500,text:'Transaction Failed!'});
													});
												}else{
													
													var service_log = {};
													service_log.mm_service_tran_status = 'Completed';
													service_log.mm_service_tran_type = 'Transfer From';
													service_log.mm_service_tran_code = 200;
													service_log.mm_service_id = service_id;
													service_log.service_value = service_value; 
													service_log.mmpay_enduser  = AboutUser.enduser_id;
													service_log.amount = amount_service_got;
													service_log.mm_service_tran_log_v_id = Math.random().toString().slice(2);
													service_log.mm_service_tran_date = moment(new Date).format('YYYY-MM-DD HH:mm:ss');
													console.log('success!',service_log);
													var sQuery_insertServiceTransaction = 'INSERT INTO mmpay_service_tranaction_log SET ?';
													connection.query(sQuery_insertServiceTransaction, service_log, function(err, result) {
														if (err) { 
															console.log(err);
															connection.rollback(function() {
																callback({status:500,text:'Transaction failed at service transaction!'});
															});
														}else{
															connection.commit(function(err) {
																if (err) { 
																	connection.rollback(function() {
																		console.log(err);
																		callback({status:500,text:'Transaction Failed!'});
																	});
																}else{
																	console.log('success!');
																	callback(null,{status:200,text:'Transaction Success!'});
																}
																
															});connection.release();
														}
													});
												}
											});
										}
									});
								}else{
									//no serivce id
									callback({status:500,text:'Service ID not found!'});
								}
							}
							
						});
					}	
			
				});

			}
		});	
	}
}

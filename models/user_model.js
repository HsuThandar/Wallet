var mysql = require('../helpers/database');
var HelperModel = require('./helper_model');
var moment = require('moment');
exports.InsertORUpdateLoggedInUser = function(userdata,callback){
	//console.log(userdata);
    mysql.getConnection(function(err, connection){
			console.log(err);
		if(err){
			callback({status:500,text:"mysql getConnection Error",data:err});
		}else{
			//console.log(userdata.email);
			var i = connection.query('call select_or_insert_mmpay_enduser(?,?,?)',[userdata.email,userdata.name,userdata.id], function(err, result){
				
				if(!err){			
					//console.log(result);
						callback(null,result);
				}else{
					callback({status:500,text:"mysql query Error",data:err});
				
				}
				
			});//console.log(i.sql);
			connection.release();
		}	
		
	});
}



exports.checkUserAlreadyRegister = function(loginaccount,callback){
	mysql.getConnection(function(err, connection){
		//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('select e.*,mw.balance from mmpay_enduser  e  LEFT JOIN `mmpay_wallet` mw ON e.enduser_id = mw.enduser_id  where e.loginaccount = ? ;',[loginaccount], function(err, result){
			
			if(err){			
				//console.log(result);
			
				callback({status:500,text:"mysql query Error",data:err});
			}else{
				callback(null,result);
			}
			
		});//console.log(i.sql);
		connection.release();
	}	
	
});
}


exports.EditUser = function(enduser_id,callback){
	
    mysql.getConnection(function(err, connection){
			//console.log(err);
		if(err){
			callback({status:500,text:"mysql getConnection Error",data:err});
		}else{
			
			var i = connection.query('CALL select_data_from_table_by_id(?,?)',['mmpay_enduser',enduser_id], function(err, result){
				
				if(!err){			
					//console.log(result);
						callback(null,result);
				}else{
					callback({status:500,text:"mysql query Error",data:err});
				
				}
				
			});//console.log(i.sql);
			connection.release();
		}	
		
	});
}


exports.checkUserExist = function(userdata,callback){
	mysql.getConnection(function(err, connection){
		//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		const md5 = require('md5');
		var i = connection.query('select enduser_id,loginaccount, displayname,role_id,is_business from mmpay_enduser where loginaccount = ? and password = ? and mmpay_enduser.is_deleted = 0 and mmpay_enduser.is_banned = 0;',[userdata.loginaccount,md5(userdata.password)], function(err, result){
			
			if(!err){			
				callback(null,result[0]);
			}else{
				//console.log(err);
				callback({status:500,text:"mysql query Error",data:err});
			
			}
			
		});console.log(i.sql);
		connection.release();
	}	
	
});
}

exports.getUserDataByID = function(enduser_id,callback){
	mysql.getConnection(function(err, connection){
		//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('select * from mmpay_enduser where enduser_id = ? ;',[enduser_id], function(err, result){
			
			if(!err){			
				//console.log(result);
					callback(null,result);
			}else{
				callback({status:500,text:"mysql query Error",data:err});
			
			}
			
		});console.log(i.sql);
		connection.release();
	}	
	
});
}



exports.saveuser = function(data,callback){
	//console.log(data);
	const md5 = require('md5');
	var old_pw =  data.old_password;
	delete data.old_password;
	var querystring ="";
	var id = data.enduser_id;
	if(data.enduser_id){
		if(data.password != old_pw){
			data.password = md5(data.password);
		}	
		
		data.last_updateddate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
		data.last_login = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
		querystring = "update mmpay_enduser set  ? where  enduser_id=?;" ; 
	}else{
		data.signup_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
		data.last_updateddate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
		data.last_login = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
		data.password = md5(data.password);
		delete data.enduser_id;
		querystring = " insert into  mmpay_enduser set ? ;";
	
	}
	
	
   
  
     mysql.getConnection(function(err, connection){
        console.log(err);
        if(err){
            callback({status:500,text:"mysql getConnection Error",data:err});
        }else{
          
            var i = connection.query(querystring,[data,id], function(err, result){
                
                if(!err){	
					if(!id){
						console.log(result);
						var str = "insert into mmpay_wallet set enduser_id= ?;  ";
						mysql.getConnection(function(err, connection){
							console.log(err);
							if(err){
								callback({status:500,text:"mysql getConnection Error",data:err});
							}else{
							  
								var i = connection.query(str,[result.insertId], function(err, result){
									
									if(!err){		
										callback(null,result);
									}else{
										callback({status:500,text:"mysql getConnection Error",data:err});
									}
								});console.log(i.sql);
							}  connection.release();   
						});	
					}else{
						 callback(null,result);
					}
					
                   
                }else{
                    callback({status:500,text:"mysql getConnection Error",data:err});
                }
            });console.log(i.sql);
        }  connection.release();   
    });

 }
 

 exports.deleteuser = function(enduser_id,callback){
	 mysql.getConnection(function(err, connection){
			 console.log(err);
		 if(err){
			 callback({status:500,text:"mysql getConnection Error",data:err});
		 }else{
			 
			 var i = connection.query("update mmpay_enduser set is_deleted=1 where enduser_id = ? ",[enduser_id], function(err, result){
				 
				 if(!err){			
					 //console.log(result);
						 callback(null,result);
				 }else{
					 callback({status:500,text:"mysql query Error",data:err});
				 
				 }
				 
			 });console.log(i.sql);
			 connection.release();
		 }	
		 
	 });
 }
 
 
 

 
exports.getAllmenu = function(callback){
	mysql.getConnection(function(err, connection){
		//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('SELECT menu_id,menu_name,is_sub,parent_id,sub_number FROM menus WHERE is_deleted = "no"  ORDER BY order_no;', function(err, result){
			
			if(!err){			
				//console.log(result);
					callback(null,result);
			}else{
				callback({status:500,text:"mysql query Error",data:err});
			
			}
			
		});console.log(i.sql);
		connection.release();
	}	
	
});
}


exports.savemerchant = function(data,callback){
	//console.log(data);
	data.registered_date =  moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
	data.lastupdated_date =  moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
	var querystring ="";
	
	data.merchant_v_id = Math.random().toString().substring(2) + (new Date()).getTime().toString().slice(8);
		
	querystring = " insert into  merchant_site set ? ;";
     mysql.getConnection(function(err, connection){
        console.log(err);
        if(err){
            callback({status:500,text:"mysql getConnection Error",data:err});
        }else{
          
            var i = connection.query(querystring,[data], function(err, result){
                
                if(!err){	
				
						//console.log(result);
						var str = "UPDATE `mmpay_enduser` SET is_business = 1 WHERE enduser_id = ? ; ";
						mysql.getConnection(function(err, connection){
							console.log(err);
							if(err){
								callback({status:500,text:"mysql getConnection Error",data:err});
							}else{
							  
								var i = connection.query(str,[data.enduser_id], function(err, result){
									
									if(!err){		
										callback(null,result);
									}else{
										callback({status:500,text:"mysql getConnection Error",data:err});
									}
								});console.log(i.sql);
							}  connection.release();   
						});	
					
					
                   
                }else{
                    callback({status:500,text:"mysql getConnection Error",data:err});
                }
            });console.log(i.sql);
        }  connection.release();   
    });

 }

exports.updatemerchant = function(data,callback){
	//console.log(data);
	
	
	data.lastupdated_date =  moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
	var querystring = " update merchant_site set ? where merchant_v_id = ? ;";
     mysql.getConnection(function(err, connection){
        console.log(err);
        if(err){
            callback({status:500,text:"mysql getConnection Error",data:err});
        }else{
          
            var i = connection.query(querystring,[data,data.merchant_v_id], function(err, result){
                
                if(!err){	
					callback(null,result);
                }else{
                    callback({status:500,text:"mysql getConnection Error",data:err});
                }
            });console.log(i.sql);
        }  connection.release();   
    });

 }
 
 
exports.getMerchantDataByEnduserID = function(enduser_id,callback){
	mysql.getConnection(function(err, connection){
		//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('select * from merchant_site where enduser_id = ? ;',[enduser_id], function(err, result){
			
			if(!err){			
				//console.log(result);
					callback(null,result);
			}else{
				callback({status:500,text:"mysql query Error",data:err});
			
			}
			
		});console.log(i.sql);
		connection.release();
	}	
	
});
}


exports.update_lastlogin_by_enduser_id = function(enduser_id,callback){
	mysql.getConnection(function(err, connection){
	//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('UPDATE `mmpay_enduser` SET last_login = NOW() WHERE enduser_id = ?',[enduser_id], function(err, result){
			
			if(!err){	
				callback(null,result);
			}else{
				
				callback({status:500,text:"mysql error",data:err});
			
			}
			
		});console.log(i.sql);
		connection.release();
	}	

	});
}


exports.savenewpassword = function(data,callback){
	const md5 = require('md5');
	var newpassword = md5(data.password);
	var v_code = data.v_token;
	
	mysql.getConnection(function(err, connection){
	//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('UPDATE `mmpay_enduser` SET PASSWORD = ? and last_updateddate = now()  WHERE enduser_id = (SELECT enduser_id FROM `resetpassword` WHERE reset_token = ?)',[newpassword,v_code], function(err, result){
			
			if(!err){	
				callback(null,result);
			}else{
				
				callback({status:500,text:"mysql error",data:err});
			
			}
			
		});console.log(i.sql);
		connection.release();
	}	

	});
}

exports.FacebookLogin = function(userObj,callback){
	mysql.getConnection(function(err, connection){
		console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('select * from mmpay_enduser where facebook_id = ?;',[userObj.facebookId], function(err, result){
			
			if(!err){
				if(result.length > 0){
					//user exist
					callback(null,result[0]);
				}else{
					//insert , user doesn't exist
					var j = connection.query('insert into mmpay_enduser set facebook_id = ?,loginaccount = ? , displayname = ?;',[userObj.facebookId,userObj.facebookId,userObj.facebookName], function(err, result){
			
						if(!err){
							
							var sQuery = 'insert into mmpay_wallet set enduser_id= ?;select * from mmpay_enduser where enduser_id = ?;'

							var w = connection.query(sQuery,[result.insertId,result.insertId], function(err, fresult){
								if(!err){
									console.log("success insert and select");
									callback(null,fresult[1][0]);
										
								}else{
									callback({status:500,text:"mysql query Error",data:err});
								
								}
								
							});console.log(w.sql);
								
						}else{
							callback({status:500,text:"mysql query Error",data:err});
						
						}
						
					});console.log(j.sql);
				}			
				//console.log(result);
					
			}else{
				callback({status:500,text:"mysql query Error",data:err});
			
			}
			
		});console.log(i.sql);
		connection.release();
	}	
	
});
}

exports.GmailLogin = function(userObj,callback){
	mysql.getConnection(function(err, connection){
		console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('select * from mmpay_enduser where gmail_id = ?;',[userObj.gmailId], function(err, result){
			
			if(!err){
				if(result.length > 0){
					callback(null,result[0]);
				}else{
					//insert
					var j = connection.query('insert into mmpay_enduser set gmail_id = ? , loginaccount = ? , displayname = ?;',[userObj.gmailId,userObj.loginaccount,userObj.gmailName], function(err, result){
						if(!err){
							console.log("success insert ");
							var sQuery = 'insert into mmpay_wallet set enduser_id= ?;select * from mmpay_enduser where enduser_id = ?;'

							var w = connection.query(sQuery,[result.insertId,result.insertId], function(err, fresult){
								if(!err){
									console.log("success insert and select");
									callback(null,fresult[1][0]);
										
								}else{
									callback({status:500,text:"mysql query Error",data:err});
								
								}
								
							});console.log(w.sql);
							//callback(null,result[1]);
								
						}else{
							callback({status:500,text:"mysql query Error",data:err});
						
						}
						
					});console.log(j.sql);
				}			
				//console.log(result);
					
			}else{
				callback({status:500,text:"mysql query Error",data:err});
			
			}
			
		});console.log(i.sql);
		connection.release();
	}	
	
});
}
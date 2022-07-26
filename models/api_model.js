var mysql = require('../helpers/database');

var moment = require('moment');
exports.checkUserExist = function(userdata,callback){
	mysql.getConnection(function(err, connection){
		//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		console.log(userdata);
		const md5 = require('md5');
		var i = connection.query("SELECT u.enduser_id,loginaccount, displayname,role_id,is_business,w.balance FROM mmpay_enduser u LEFT JOIN `mmpay_wallet` w ON u.enduser_id = w.enduser_id WHERE loginaccount = ? AND PASSWORD = ?;",[userdata.loginaccount,md5(userdata.password)], function(err, result){
			
			if(!err){			
                console.log("result");
                console.log(result);
               
				callback(null,result);
			}else{
				//console.log(err);
				callback({status:500,text:"mysql query Error",data:err});
			
			}
			
		});console.log(i.sql);
		connection.release();
	}	
	
});
}



  
exports.getMerchantDataBymerchant_v_id = function(merchant_v_id,callback){
	mysql.getConnection(function(err, connection){
		//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('SELECT s.*,u.displayname,u.loginaccount FROM merchant_site s LEFT JOIN mmpay_enduser u ON s.enduser_id = u.enduser_id  WHERE s.merchant_v_id = ? ;',[merchant_v_id], function(err, result){
			
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


exports.updateBalance = function(amount,enduser_id,type,callback){
	var str = "";
	if(type == "add"){
		str = "update `mmpay_wallet` SET balance = balance + ? where enduser_id = ?";
	}else{
		//deduct
		str = "update `mmpay_wallet` SET balance = balance - ? where enduser_id = ?";
    }
    console.log(str);
	mysql.getConnection(function(err, connection){
		//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query(str,[amount,enduser_id], function(err, result){
			
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


exports.insertTransaction = function(reqData,callback){
    var queryString = " INSERT INTO transaction_log SET ?";
    mysql.getConnection(function(err, connection){
        console.log(err);
    if(err){
        callback({status:500,text:"mysql getConnection Error",data:err});
    }else{
        
        var i = connection.query(queryString,[reqData], function(err, result){
            
            if(!err){			
				//console.log(result);
				//update merchant site last updated date
                callback(null,result);
            }else{
                callback({status:500,text:"mysql query Error",data:err});
            
            }
            
        });console.log(i.sql);
        connection.release();
    }	
    
});
}



exports.enduser_lastupdate_by_enduser_id = function(enduser_id,callback){
	mysql.getConnection(function(err, connection){
		//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('UPDATE mmpay_enduser SET `last_updateddate` = NOW() WHERE enduser_id = ? ;',[enduser_id], function(err, result){
			
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


exports.merchant_lastupdatedDate_by_merchantID  = function(merchant_id,callback){	
	mysql.getConnection(function(err, connection){
	//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('UPDATE `merchant_site` SET `lastupdated_date` = NOW() WHERE merchant_id = ?',[merchant_id], function(err, result){
			
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

exports.getService=function(callback){
	var sQuery = 'SELECT m.merchant_name,p.payment_menthod_type,p.service_id FROM `payment_service` p LEFT JOIN `merchant_site` m ON p.merchant_id = m.merchant_id';
	mysql.getConnection(function(err, connection){
		//console.log(err);
		if(err){
			callback({status:500,text:"mysql getConnection Error",data:err});
		}else{
			//console.log(userdata.email);
			var i = connection.query(sQuery, function(err, result){
				
				if(!err){
					var data={};	
					data.operator = [];
					data.banking = [];
					data.ewallet = [];
					for(var i=0;i<result.length;i++){
						if(result[i].payment_menthod_type == 'operator'){
							data.operator.push(result[i]);
						}else if(result[i].payment_menthod_type == 'banking'){
							data.banking.push(result[i]);
						}else if(result[i].payment_menthod_type == 'e-wallet'){
							data.ewallet.push(result[i]);
						}


						
					}
					callback(null,data);
				}else{
					
					callback({status:500,text:"mysql error",data:err});
				
				}
				
			});console.log(i.sql);
			connection.release();
		}	
	
		});
}



exports.getMerchantDataByService_id = function(service_id,callback){
	mysql.getConnection(function(err, connection){
		//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('SELECT s.enduser_id FROM merchant_site s LEFT JOIN `payment_service` ps ON ps.merchant_id = s.merchant_id  WHERE ps.service_id = ? ;',[service_id], function(err, result){
			
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

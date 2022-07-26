
var mysql = require('../helpers/database');
var HelperModel = require('./helper_model');


exports.getWalletDataByEndUserID = function(enduser_id,callback){
	mysql.getConnection(function(err, connection){
		//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('SELECT w.`mmpay_wallet_id`,w.`balance`,u.enduser_id,u.displayname,u.loginaccount FROM `mmpay_enduser` u LEFT JOIN  mmpay_wallet w  ON w.enduser_id  = u.enduser_id  WHERE u.enduser_id =? ;',[enduser_id], function(err, result){
			
			if(!err){			
				//console.log(result);
				if(!result[0].balance){
					result[0].balance = 0;
				}
					callback(null,result);
			}else{
				callback({status:500,text:"mysql query Error",data:err});
			
			}
			
		});//console.log(i.sql);
		connection.release();
	}	
	
});
}

exports.updateBalance = function(amount,enduser_id,type,callback){
	var str = "";
	if(type == "add"){
		str = "update `mmpay_wallet` SET balance = balance + ? where enduser_id = ?";
	}else{
		//withdraw
		str = "update `mmpay_wallet` SET balance = balance - ? where enduser_id = ?";
	}
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
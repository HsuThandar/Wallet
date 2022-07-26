var mysql = require('../helpers/database');
var HelperModel = require('./helper_model');


exports.getAllBankingMethod = function(callback){
	mysql.getConnection(function(err, connection){
		//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query(' SELECT service_id,service_name FROM `payment_service`   WHERE `payment_menthod_type` = "banking"', function(err, result){
			
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


exports.getAllService = function(callback){
	mysql.getConnection(function(err, connection){
		//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query(' SELECT * FROM `payment_service`   WHERE is_deleted = 0;', function(err, result){
			
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
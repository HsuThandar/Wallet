const mysql = require('../helpers/database');

exports.SaveEnquiryForm = function(data,callback){
	mysql.getConnection(function(err, connection){
		//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('insert into enquirybox set ? ;',[data], function(err, result){
			
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


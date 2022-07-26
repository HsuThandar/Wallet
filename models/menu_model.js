var mysql = require('../helpers/database');


exports.getAllMenus = function(enduser_id,callback){
    
    mysql.getConnection(function(err, connection){
			console.log(err);
		if(err){
			callback({status:500,text:"mysql getConnection Error",data:err});
		}else{
			var i = connection.query("SELECT * FROM menus WHERE is_deleted = 'no' AND FIND_IN_SET( menu_id,(SELECT permission FROM roles WHERE role_id = (SELECT role_id FROM mmpay_enduser WHERE enduser_id = ?)) ) ORDER BY order_no;",[enduser_id], function(err, result){
				
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

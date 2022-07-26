const mysql = require('../helpers/database');

exports.insert_or_update  = function (table_name,id_column_name,id,data,callback){
    var querystring ="";
    if(id){
        querystring = "update " + table_name + " set  ? where  " + id_column_name + "=" + id +  ";" ; 
    }else{
        delete data[id_column_name];
        querystring = " insert into  " + table_name + " set ? ";
    }
  
     mysql.getConnection(function(err, connection){
        console.log(err);
        if(err){
            callback({status:500,text:"mysql getConnection Error",data:err});
        }else{
          
            var i = connection.query(querystring,[data], function(err, result){
                
                if(!err){		
                    callback(null,result);
                }else{
                    callback({status:500,text:"mysql getConnection Error",data:err});
                }
            });console.log(i.sql);
        }  connection.release();   
    });
}

exports.makeid = function(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       //result += characters.charAt(Math.floor(Math.random() * charactersLength));
       result += Math.floor(Math.random() * charactersLength);
    }
    return result.substring(0, 15);

 }

exports.checkdomain = function(domainname,callback) {
    const dns = require('dns');
    var removetext = domainname.match(/http|https/) + "://";
    var real_domain = domainname.replace(removetext,'');
    real_domain = real_domain.replace('/','');
    //console.log(real_domain);
    dns.lookup(real_domain, (err, address, family) => {
    console.log('address: %j family: IPv%s ', address, family);
    if(address){
        callback(null,address);
    }else{
       callback(500);
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




exports.transaction_lastupdatedDate_by_merchantID  = function(merchant_id,callback){	
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



exports.get_api  = function(id,callback){	
	mysql.getConnection(function(err, connection){
	//console.log(err);
	if(err){
		callback(null);
	}else{
		//console.log(userdata.email);
		var i = connection.query('SELECT * FROM `mmpay_api` WHERE id= ?',[id], function(err, result){
			
			if(!err){	
				callback(result[0].data);
			}else{
				
				callback(null);
			
			}
			
		});console.log(i.sql);
		connection.release();
	}	

	});
}


exports.insertResetPassword = function(obj,callback){
	mysql.getConnection(function(err, connection){
		//console.log(err);
		if(err){
			callback({status:500,text:"mysql getConnection Error",data:err});
		}else{
			//console.log(userdata.email);
			var i = connection.query('INSERT INTO `resetpassword` SET ?',[obj], function(err, result){
				
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

exports.getResetCodeviaV_token = function(v_token,callback){
	mysql.getConnection(function(err, connection){
		//console.log(err);
		if(err){
			callback({status:500,text:"mysql getConnection Error",data:err});
		}else{
			//console.log(userdata.email);
			var i = connection.query('SELECT reset_code,enduser_id,reset_date FROM `resetpassword` WHERE reset_token = ?',[v_token], function(err, result){
				
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

exports.update_is_reset = function(v_token,callback){
	mysql.getConnection(function(err, connection){
		//console.log(err);
		if(err){
			callback({status:500,text:"mysql getConnection Error",data:err});
		}else{
			//console.log(userdata.email);
			var i = connection.query('UPDATE `resetpassword` SET is_reset = 1 , reset_date = NOW() WHERE reset_token = ?',[v_token], function(err, result){
				
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

exports.commission_fee = function(callback){
	var commission_fee = require('../../models/helper_model').api.commission_fee;
}
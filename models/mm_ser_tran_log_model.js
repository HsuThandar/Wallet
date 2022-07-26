
var mysql = require('../helpers/database');
var HelperModel = require('./helper_model');
var moment= require('moment');


exports.insertServiceTransaction = function(reqData,callback){
    reqData.mm_service_tran_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    var queryString = " INSERT INTO mmpay_service_tranaction_log SET ?";
    mysql.getConnection(function(err, connection){
        console.log(err);
    if(err){
        callback({status:500,text:"mysql getConnection Error",data:err});
    }else{
        
        var i = connection.query(queryString,[reqData], function(err, result){
            
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

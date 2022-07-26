
var mysql = require('../helpers/database');
var HelperModel = require('./helper_model');
var moment= require('moment');


exports.insertMMPayUserTransaction = function(reqData,callback){
    reqData.mm_tran_date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    var queryString = " INSERT INTO mmpayuser_transaction_log SET ?";
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



exports.getAlltransactionlogList_foreachuser = function(querystring,enduser_id,cb){
    //console.log("eachh")
   var aColumns = ["t.mm_tran_log_v_id","t.mm_tran_date","IFNULL(IFNULL((SELECT loginaccount FROM mmpay_enduser WHERE enduser_id = t.record_object),ps.service_name),ms.merchant_name) AS loginaccount","t.mm_tran_status","t.mm_tran_log_id"];   
  /* Indexed column (used for fast and accurate table cardinality)*/
  var sIndexColumn = "mm_tran_log_id";

 /* DB table to use */
 var sTable = "mmpayuser_transaction_log t";
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
 
    

    var sFilter = "  ";
    if(querystring.from_date && querystring.to_date){
        //from-date - from date to now
        //to-date - from init to date
        //both from-date to to-date
        sFilter =  " and t.mm_tran_date between '" +  moment(querystring.from_date).format('YYYY-MM-DD') + "' and '" + moment(querystring.to_date).format('YYYY-MM-DD') + "' ";
    }else if(querystring.from_date && !querystring.to_date){
        sFilter = " and t.mm_tran_date >= '" +  moment(querystring.from_date).format('YYYY-MM-DD') + "' ";
    
    }else if(!querystring.from_date && querystring.to_date){
        sFilter = " and t.mm_tran_date <= '" +  moment(querystring.to_date).format('YYYY-MM-DD') + "' ";
    }

 // search		
 var sWhere = " where  t.record_subject =  " + enduser_id + " " + sFilter; 
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



 sQuery = "SELECT SQL_CALC_FOUND_ROWS "+aColumns.join()+" FROM "+ sTable + "   LEFT JOIN `payment_service` ps ON t.service_id = ps.service_id    LEFT JOIN `merchant_site` ms ON t.merchant_refunder = ms.merchant_id " + sWhere+ sOrder+ sLimit;
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
                                  
                                  output['aaData'][count] =[rResult[k].mm_tran_log_v_id,moment(rResult[k].mm_tran_date).format('YYYY-MM-DD hh:mm:ss'),rResult[k].loginaccount,rResult[k].mm_tran_status,rResult[k].mm_tran_log_id];
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


exports.transactiondetails_forenduser = function(mm_tran_log_id,callback){
	mysql.getConnection(function(err, connection){
        console.log(err);
    if(err){
        callback({status:500,text:"mysql getConnection Error",data:err});
    }else{
        
        var i = connection.query("SELECT t.*,ps.service_name,ms.merchant_name,(SELECT loginaccount FROM mmpay_enduser WHERE enduser_id = t.record_subject) AS r_subject,(select loginaccount from mmpay_enduser where enduser_id = t.record_object) as r_object \
        FROM `mmpayuser_transaction_log` t \
        LEFT JOIN `merchant_site` ms ON t.merchant_refunder = ms.merchant_id\
        LEFT JOIN `payment_service` ps ON t.service_id = ps.service_id  WHERE t.mm_tran_log_id=?",[mm_tran_log_id], function(err, result){
            
            if(!err){			
				//console.log(result);
				if(result.length > 0){
					result[0].mm_tran_date = moment(result[0].mm_tran_date).format('YYYY-MM-DD hh:mm:ss');

					callback(null,result[0]);
				}else{
					callback({status:500,text:"transaction not found",data:err});
				}
                
            }else{
                callback({status:500,text:"mysql query Error",data:err});
            
            }
            
        });console.log(i.sql);
        connection.release();
    }	
    
});
 }

 exports.gettransactionlist_byenduserid = function(reqData,callback){
    var sFilter = "  ";
    if(reqData.from_date && reqData.to_date){
        //from-date - from date to now
        //to-date - from init to date
        //both from-date to to-date
        sFilter =  " and t.mm_tran_date between '" +  moment(reqData.from_date).format('YYYY-MM-DD') + "' and '" + moment(reqData.to_date).format('YYYY-MM-DD') + "' ";
    }else if(reqData.from_date && !reqData.to_date){
        sFilter = " and t.mm_tran_date >= '" +  moment(reqData.from_date).format('YYYY-MM-DD') + "' ";
    
    }else if(!reqData.from_date && reqData.to_date){
        sFilter = " and t.mm_tran_date <= '" +  moment(reqData.to_date).format('YYYY-MM-DD') + "' ";
    }

   var sql = "SELECT t.mm_tran_log_v_id,t.mm_tran_date,IFNULL(IFNULL((SELECT loginaccount FROM mmpay_enduser WHERE enduser_id = t.record_object),ps.service_name),ms.merchant_name) AS loginaccount,t.mm_tran_status,t.amount,t.old_balance,t.new_balance FROM mmpayuser_transaction_log t   LEFT JOIN `payment_service` ps ON t.service_id = ps.service_id    LEFT JOIN `merchant_site` ms ON t.merchant_refunder = ms.merchant_id  where  t.record_subject =  "
   + reqData.enduser_id + sFilter +  "   ORDER BY  t.mm_tran_date desc;";
   mysql.getConnection(function(err, connection){
    console.log(err);
if(err){
    callback({status:500,text:"mysql getConnection Error",data:err});
}else{
    
    var i = connection.query(sql, function(err, result){
        
        if(!err){			
            //console.log(result);
            if(result.length > 0){
               
                callback(null,{status:200,text:"Start Downloading.",data:result});
            }else{
                callback({status:500,text:"transaction not found",data:err});
            }
            
        }else{
            callback({status:500,text:"mysql query Error",data:err});
        
        }
        
    });console.log(i.sql);
    connection.release();
}	

});

}
 
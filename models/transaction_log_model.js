
var mysql = require('../helpers/database');
var HelperModel = require('./helper_model');
var moment= require('moment');


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
    var aColumns = ["mmpay_tran_v_id","date","DATE,IFNULL(m.`merchant_name`,me.loginaccount) AS _to ","transaction_status","mmpay_transaction_id"];   
   /* Indexed column (used for fast and accurate table cardinality)*/
   var sIndexColumn = "mmpay_transaction_id";
 
  /* DB table to use */
  var sTable = "transaction_log t";
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
  var sWhere = " where  t.subject =  " + enduser_id + " "; 
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
 
  sQuery = "SELECT SQL_CALC_FOUND_ROWS "+aColumns.join()+" FROM "+ sTable + " LEFT JOIN `merchant_site` m ON m.`merchant_id` = t.merchant_id LEFT JOIN `mmpay_enduser` me ON t.recipient = me.enduser_id " + sWhere+ sOrder+ sLimit;
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
                                   
	  
								   output['aaData'][count] =[rResult[k].mmpay_tran_v_id,moment(rResult[k].date).format('YYYY-MM-DD hh:mm:ss'),rResult[k]._to,rResult[k].transaction_status,rResult[k].mmpay_transaction_id];
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

exports.getAlltransactionlogList_foreachMerchant = function(querystring,merchant_id,cb){
	 
    var aColumns = ["mmpay_tran_v_id","date","mmpay_enduser.loginaccount","transaction_status","mmpay_transaction_id"];   
   /* Indexed column (used for fast and accurate table cardinality)*/
   var sIndexColumn = "mmpay_transaction_id";
 
  /* DB table to use */
  var sTable = "transaction_log";
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
  var sWhere = " where  transaction_log.merchant_id =  " + merchant_id + " "; 
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
 
  sQuery = "SELECT SQL_CALC_FOUND_ROWS "+aColumns.join()+" FROM "+ sTable + " left join  mmpay_enduser on   mmpay_enduser.enduser_id = transaction_log.subject " + sWhere+ sOrder+ sLimit;
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
                                   
	  
								   output['aaData'][count] =[rResult[k].mmpay_tran_v_id,moment(rResult[k].date).format('YYYY-MM-DD hh:mm:ss'),rResult[k].loginaccount,rResult[k].transaction_status,rResult[k].mmpay_transaction_id];
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


 exports.transactiondetail = function(mmpay_transaction_id,callback){
	mysql.getConnection(function(err, connection){
        console.log(err);
    if(err){
        callback({status:500,text:"mysql getConnection Error",data:err});
    }else{
        
        var i = connection.query("select t.*,IFNULL(m.`merchant_name`,me.loginaccount) AS _to  from transaction_log t LEFT JOIN `merchant_site` m ON m.`merchant_id` = t.merchant_id LEFT JOIN `mmpay_enduser` me ON t.recipient = me.enduser_id  where t.mmpay_transaction_id=? ",[mmpay_transaction_id], function(err, result){
            
            if(!err){			
				//console.log(result);
				if(result.length > 0){
					result[0].date = moment(result[0].date).format('YYYY-MM-DD hh:mm:ss');

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

 
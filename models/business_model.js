var mysql = require('../helpers/database');
var HelperModel = require('./helper_model');
var moment= require('moment');


exports.getAllBusinessList_foreachuser = function(querystring,enduser_id,cb){
	 
    var aColumns = ["merchant_v_id","merchant_name","merchant_domainurl","lastupdated_date","merchant_site.is_deleted","merchant_id"];   
   /* Indexed column (used for fast and accurate table cardinality)*/
   var sIndexColumn = "merchant_id";
 
  /* DB table to use */
  var sTable = "merchant_site";
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
  var sWhere = " where  merchant_site.enduser_id =  " + enduser_id + " "; 
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
 
  sQuery = "SELECT SQL_CALC_FOUND_ROWS "+aColumns.join()+" FROM "+ sTable + " left join mmpay_enduser on mmpay_enduser.enduser_id = merchant_site.enduser_id " + sWhere+ sOrder+ sLimit;
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
									
								
           
								   output['aaData'][count] =[rResult[k].merchant_v_id,rResult[k].merchant_name,rResult[k].merchant_domainurl,moment(rResult[k].lastupdated_date).format('YYYY-MM-DD hh:mm:ss'),rResult[k].is_deleted,rResult[k].merchant_id];
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
  
exports.getMerchantDataByMerchantID = function(merchant_id,callback){
	mysql.getConnection(function(err, connection){
		//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('SELECT s.*,u.displayname,u.loginaccount FROM merchant_site s LEFT JOIN mmpay_enduser u ON s.enduser_id = u.enduser_id  WHERE s.merchant_id = ? ;',[merchant_id], function(err, result){
			
			if(!err){			
				//console.log(result);
				if(result.length > 0){
					result[0].registered_date = moment(result[0].registered_date).format('YYYY-MM-DD hh:mm:ss');
					result[0].lastupdated_date = moment(result[0].lastupdated_date).format('YYYY-MM-DD hh:mm:ss');
					callback(null,result[0]);
				}else{
					callback({status:500,text:"No Merchant",data:err});
				}
				
			}else{
				callback({status:500,text:"mysql query Error",data:err});
			
			}
			
		});console.log(i.sql);
		connection.release();
	}	
	
});
}

exports.getAllBusiness_byenduser_id  = function(enduser_id,callback){	
	mysql.getConnection(function(err, connection){
	//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('SELECT merchant_name,merchant_id FROM merchant_site WHERE enduser_id = ?',[enduser_id], function(err, result){
			
			if(!err){	
				if(result.length>0){
					callback(null,result);
				}else{
					callback({status:500,text:"no Business",data:err});
				}	
				
			}else{
				
				callback({status:500,text:"no Business",data:err});
			
			}
			
		});console.log(i.sql);
		connection.release();
	}	

	});
}

exports.activemerchant  = function(merchant_v_id,callback){	
	mysql.getConnection(function(err, connection){
	//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('update merchant_site set is_deleted = 0 where merchant_v_id = ?',[merchant_v_id], function(err, result){
			
			if(!err){	
				
					callback(null,{status:200,text:"Successfully updated!"});
					
				
			}else{
				
				callback({status:500,text:"no Business",data:err});
			
			}
			
		});console.log(i.sql);
		connection.release();
	}	

	});
}

exports.deactivemerchant  = function(merchant_v_id,callback){	
	mysql.getConnection(function(err, connection){
	//console.log(err);
	if(err){
		callback({status:500,text:"mysql getConnection Error",data:err});
	}else{
		//console.log(userdata.email);
		var i = connection.query('update merchant_site set is_deleted = 1 where merchant_v_id = ?',[merchant_v_id], function(err, result){
			
			if(!err){	
				callback(null,{status:200,text:"Successfully updated!"});
				
			}else{
				
				callback({status:500,text:"no Business",data:err});
			
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
		var i = connection.query('SELECT s.* FROM merchant_site s LEFT JOIN `payment_service` ps ON ps.merchant_id = s.merchant_id  WHERE ps.service_id = ? ;',[service_id], function(err, result){
			
			if(!err){			
				//console.log(result);
				if(result.length < 1){
					callback({status:500,text:"No Merchant",data:err});
				}else{
					callback(null,result[0]);
				}
					
			}else{
				callback({status:500,text:"mysql query Error",data:err});
			
			}
			
		});console.log(i.sql);
		connection.release();
	}	
	
});
}
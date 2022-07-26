var mysql = require('mysql');
var CONFIG = require('./config');

var pool  = mysql.createPool({
    connectionLimit : 100,
    host: CONFIG.db.host,
    database:CONFIG.db.database,
    user: CONFIG.db.user,
    password : CONFIG.db.password,
    port : CONFIG.db.port,
    multipleStatements:true
});

exports.getConnection = function(callback) {
    pool.getConnection(function(err, connection) {
        if(err)
        {
            callback(err);            
        }
        else
        {
            callback(err, connection);    
        }
        
    });
};

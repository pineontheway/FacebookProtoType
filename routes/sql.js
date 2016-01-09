/*var mysql =  require('mysql');                  " +
"
  var pool =  mysql.createPool({
	host : “hostName”,
	user : “username”,
	password: “password”
  });	
  
  pool.getConnection(function(err, connection){
	  connection.query( “select * from table1”,  function(err, rows){
	  	if(err)	{
	  		throw err;
	  	}else{
	  		console.log( rows );
	  	}
	  });
	  
	  connection.release();
	});
  
  
  Executing Multiple Statement Queries in MySQL Node.js

For security purpose, by default, executing multiple statement queries is disabled. To use multiple statement queries, you should first enable it while creating a connection as shown below.
  var connection =  mysql.createConnection( { multipleStatements: true } );
  connection.query('select column1; select column2; select column3;', function(err, result){
	  if(err){
	  	throw err;
	  }else{
	  	console.log(result[0]);       // Column1 as a result
	  	console.log(result[1]);       // Column2 as a result
	  	console.log(result[2]);       // Column3 as a result
	  }
	});*/
var ejs= require('ejs');
var mysql =  require('mysql');
var mysql = require('mysql');
var ejs= require('ejs');
function getConnection(){
	var connection = mysql.createConnection({
		  host: 'localhost',
		  user: 'root',
		  password: 'root',
		  database: 'facebook'
		});
		return connection;
}
function insertDatatoDatabase(query,params,callback){
	query = mysql.format(query,params);
	var connection = getConnection();
	connection.connect();
	console.log(query);
	connection.query(query, function(err, rows, fields) {
		  if (!err){
				console.log("data inserted");
				callback(err,rows);
		  }
		  else{
			  json_responses = {"statusCode" : 200};
			  return json_responses; 
		  }
		});

		connection.end();
}

function getDataFromDatabase(query,callback){
	var connection = getConnection();
	connection.connect();
	
	connection.query(query, function(err, rows, fields) {
		  if (!err){
			  console.log("data retrieved from database"+rows);
		    callback(err,rows);
		  }
		  else
		    console.log('Error while performing Query in getting data from database');
		});

		connection.end();
}


function execQuery(query,callback){
	var connection = getConnection();
	connection.connect();
	console.log("query is"+query);
	connection.query(query, function(err, rows) {
		  if (!err){
		    console.log('The query is executed');
		  }
		  else
		    console.log('Error while performing executing Query.');
		  	callback(err,rows);
		});

		connection.end();
}
exports.insertDatatoDatabase=insertDatatoDatabase;
exports.execQuery=execQuery;
exports.getDataFromDatabase=getDataFromDatabase;


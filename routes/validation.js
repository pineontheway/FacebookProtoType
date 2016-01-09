var mysql = require('./sql');

exports.login = function(req, res){
	var email = req.param("email");
	var password = req.param("password");
	var selectQuery = "select * from userprofile where email ='"+email+"'";
	mysql.getDataFromDatabase(selectQuery,function(err,results){
		if(err){
			console.log("error occured while getting details for email id");
		}
		else{
			console.log(results);
			if(results.length>0){
				if((email==results[0].email) && (password==results[0].password)){
					req.session.email=results[0].email;
					req.session.username=results[0].firstName;
					console.log("email id and password found in database. Email:"+req.session.email+"Username:"+req.session.username);
					json_responses = {"statusCode" : 200};
					res.send(json_responses);
				}
			}
			else{
				json_responses = {"statusCode" : 401};
				res.send(json_responses);
			}
		}
	});
};

exports.signup = function(req, res){
	var firstName= req.param("firstName");
	var lastName= req.param("lastName");
	var email= req.param("email");
	var confirmEmail= req.param("confirmEmail");
	var signupPassword= req.param("signupPassword");
	var date=req.param("date");
	var month=req.param("month");
	var year=req.param("year");
	var dob= year+"-02-"+date;
	var gender= req.param("gender");
	var selectQuery = "select * from userprofile where email ='"+email+"'";
	mysql.getDataFromDatabase(selectQuery,function(err,results){
		if(err){
			console.log("error occured while getting details for email id");
		}
		else{
			if(results.length>0){
				console.log("email id already exists");
				userMessage={
							success:"",
							failure:"Details found in database. Email id already exists"
					};
				return res.json(userMessage);	 
			}
			else{
				var insertQuery = "insert into userprofile (firstName, lastName,email,password,dateOfBirth,gender) values (?,?,?,?,?,?)";
				var params = [firstName,lastName,email,signupPassword,dob,gender];
				mysql.insertDatatoDatabase(insertQuery,params, function(err,results){
					if(err){
						
					}
					else{
						res.send({'status':'success'});
					}
				});
			}
		}
	});
};

exports.redirectToHomepage=function(req,res)
{
	console.log("function entered here")
	//Checks before redirecting whether the session is valid
	if(req.session.username)
	{
		//Set these headers to notify the browser not to maintain any cache for the page being loaded
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		console.log(req.session.username);
		res.render("homepage",{username:req.session.username});
	}
	else
	{
		res.redirect('/');
	}
};
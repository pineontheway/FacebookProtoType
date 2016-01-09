exports.usersignup=function(req,res){
	userMessage={
			success:"",
			failure:"Details found in database. Email id already exists"
	};
	return res.json(userMessage);
};
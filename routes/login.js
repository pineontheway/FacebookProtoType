/**
 * Routes file for Login
 */
var mysql = require('./sql');
var sqlConnection=require('mysql');
var pass = require('password-hash-and-salt');
var myuser = [];
var connection = sqlConnection.createConnection({
	  host: 'localhost',
	  user: 'root',
	  password: 'root',
	  database: 'facebook'
	});
exports.checklogin = function(req,res)
{
	var username, password;
	var email = req.param("email");
	password = req.param("password");
	var user=[];
	pass(password).hash(
			function(error, hash){
				if(error){
					throw error;
				}
				user.hash = hash;
				if(user.hash){
					var query = "select * from userprofile where email ="+connection.escape(email)+"";
					console.log(query);
					mysql.getDataFromDatabase(query, function(err, results) {
						if(err){
							
						}
						else{
							if(results.length>0){
								pass(password).verifyAgainst(results[0].password, function(error, verified) {
							        if(error)
							            throw new Error('Something went wrong!');
							        console.log("verified value:"+verified);
							        if(!verified) {
										console.log("Incorrect login");
										res.send({"status":"fail" , 'msg': 'Incorrect Login'});
							        } else {
							        	req.session.email=results[0].email;
										req.session.username=results[0].firstName;
										console.log("initialized");
										console.log("email id and password found in database. Email:"+req.session.email+"Username:"+req.session.username);
										res.send({"status":"success" , 'msg': 'success'});
							        }
							    });
							}
							else{
								console.log("No Such user found");
								res.send({"status":"fail" , 'msg': 'No Such User'});
							}
						}
					});
				}
			}
			
		);
};

//Redirects to the homepage
exports.redirectToHomepage = function(req,res)
{
	console.log("entered redirect function");
	//Checks before redirecting whether the session is valid
	if(req.session.email)
	{
		var summary;
		var education;
		var work;
		var contact;
		var lifeevents;
		var newsFeed;
		//Set these headers to notify the browser not to maintain any cache for the page being loaded
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		var selectQuery = "select * from userprofile where email ='"+req.session.email+"'";
		console.log(selectQuery);
		mysql.getDataFromDatabase(selectQuery,function(err,results){
			if(err){
				console.log("error occured while getting details for email id");
			}
			else{
				console.log("data retrieved from userprofile table"+results);
				summary = results[0].overview;
				var work_query = "select * from work where emailid ='"+req.session.email+"'";
				mysql.getDataFromDatabase(work_query,function(err,results){
					if(err){
						console.log("error while getting details from work table");
					}
					else{
						console.log("data retrieved from work table");
						for(var i=0;i<results.length;i++){
							console.log(results[i]);
						}
						work=results;
						var edu_query="select * from education where emailid ='"+req.session.email+"'";
						mysql.getDataFromDatabase(edu_query,function(err,results){
							if(err){
								console.log("error while getting details from education table");
							}
							else{
								console.log("data retrieved from education table");
								for(var i=0;i<results.length;i++){
									console.log(results[i]);
								}
								education=results;
								var contact_query="select * from contacts where emailid ='"+req.session.email+"'";
								mysql.getDataFromDatabase(contact_query,function(err,results){
									if(err){
										console.log("error while getting details from contacts table")
									}
									else{
										console.log("data retrieved from contact table");
										for(var i=0;i<results.length;i++){
											console.log(results[i]);
										}
										contact=results;
										var lifeevents_query="select * from lifeevents where emailid ='"+req.session.email+"'";
										mysql.getDataFromDatabase(lifeevents_query,function(err,results){
											if(err){
												console.log("error while getting details from lifeevents table");
											}
											else{
												console.log("data retrieved from life table");
												for(var i=0;i<results.length;i++){
													console.log(results[i]);
												}
												lifeevents=results;
												var newsfeed_query="select firstName,newsfeed from newsfeed where emailID='"+req.session.email +"' OR emailID IN (SELECT friendEmailID from friends where emailID='"+req.session.email+"' AND status='Friend') ORDER BY date DESC;";
												mysql.getDataFromDatabase(newsfeed_query,function(err,results){
													if(err){
														
													}
													else{
														newsFeed=results;
														console.log(newsFeed);
														var get_groups_query="select * from groups where groupmembers='"+req.session.email+"'";
														mysql.getDataFromDatabase(get_groups_query, function(err, results) {
															if(err){
																
															}
															else{
																var groups=results;
																res.render("homepage",{'username':req.session.username,'summary':summary,'work':work,'education':education,'contact':contact,'lifeevents':lifeevents,'newsFeed':newsFeed,'groups':groups});
															}
														})
													}
												});
											}
										});
									}
								});
							}
						});
					}
				});
			}
		});
	}
	else
	{
		res.redirect('/');
	}
};


//Logout the user - invalidate the session
exports.logout = function(req,res)
{
	req.session.destroy();
	res.redirect('/');
};

exports.usersignup=function(req,res){
	var firstName=req.param("firstName");
	var lastName=req.param("lastName");
	var email=req.param("email");
	var confirmEmail=req.param("confirmEmail");
	var signupPassword=req.param("signupPassword");
	var gender=req.param("gender");
	var myuser = [];
	console.log(firstName+""+lastName+""+email+""+confirmEmail+""+signupPassword+""+gender);
	var selectQuery = "select * from userprofile where email ="+connection.escape(email)+"";
	mysql.getDataFromDatabase(selectQuery,function(err,results){
		if(err){
			console.log("error occured while getting details for email id");
			res.send({"status":"fail" , 'msg': 'Error'});
		}
		else{		
			if(results.length>0){
				console.log("Entered email id already exists");
				res.send({"status":"fail" , 'msg': 'Email ID Already exists.'});
			}
			else{
				pass(signupPassword).hash(
					function(error, hash) {
						if (error) {
								console.log(error);
						}
							//saving the hash
						myuser.hash = hash;
						if (myuser.hash) {
								//storing the hash in the database
							query = "insert into userprofile (firstName, lastName,email,password,gender) values (?,?,?,?,?)";
							var params = [firstName,lastName,email,myuser.hash,gender];
							console.log(query);
							mysql.insertDatatoDatabase(query, params, function(err, results) {
								if(err){
									res.send({"status":"fail" , 'msg': 'error querying data'});
								}
								else{
									if(err){
										console.log(err);
									}
									console.log(results);
									if(results){
										console.log("successfully inserted");
										req.session.email=email;
										req.session.username=firstName;
										console.log("username and email session created"+req.session.email+"  "+req.session.username);
										res.send({"status":"success" , 'msg': 'Account created successfully'});
									}else{
										res.send({"status":"fail" , 'msg': 'failed insertion'});
									}
								}
							});
						}
					});

			}
		}
	});
};

exports.gettingStarted=function(req,res){
	console.log("username and email session created in getting started"+req.session.email+"  "+req.session.username);
	if(req.session.email){
		res.render("gettingStarted",{'username':req.session.username,'email':req.session.email});
	}
	else{
		res.redirect('/');
	}
};

exports.storePersonalData=function(req,res){
	var summary=req.param("summary");
	var work=req.param("worktextbox1");
	var education=req.param("education");
	var contact=req.param("contact");
	var life_events=req.param("life_events");
	var music=req.param("music");
	var shows=req.param("shows");
	var sports=req.param("sports");
	var insert_summary_query="update userprofile set overview=? where email=?";
	var params = [summary,req.session.email];
	mysql.insertDatatoDatabase(insert_summary_query,params,function(err,results){
		if(err){
			res.send({"status":"fail" , 'msg': 'Error in saving data'});
		}
		else{
			var insert_work_query="insert into work (emailid,work) values(?,?)";
			var params = [req.session.email,work];
			mysql.insertDatatoDatabase(insert_work_query,params,function(err,results){
				if(err){
					res.send({"status":"fail" , 'msg': 'Error in saving data'});
				}
				else{
					var insert_education_query="insert into education (emailid,education) values(?,?)";
					var params=[req.session.email,education];
					mysql.insertDatatoDatabase(insert_education_query,params,function(err,results){
						if(err){
							res.send({"status":"fail" , 'msg': 'Error in saving data'});
						}
						else{
							var insert_contact_query="insert into contacts (emailid,contact) values(?,?)";
							var params=[req.session.email,contact];
							mysql.insertDatatoDatabase(insert_contact_query,params,function(err,results){
								if(err){
									res.send({"status":"fail" , 'msg': 'Error in saving data'});
								}
								else{
									var insert_lifeevents_query="insert into lifeevents(emailid,lifeevents) values(?,?)";
									var params=[req.session.email,life_events];
									mysql.insertDatatoDatabase(insert_lifeevents_query,params,function(err,results){
										if(err){
											res.send({"status":"fail" , 'msg': 'Error in saving data'});
										}
										else{
											console.log(music);
											console.log(shows);
											console.log(sports);
											
											var insert_interests_query="insert into interests(email,music,shows,sports) values(?,?,?,?)";
											var params=[req.session.email,music,shows,sports];
											mysql.insertDatatoDatabase(insert_interests_query, params, function(err, results) {
												if(err){
													res.send({"status":"fail" , 'msg': 'Error in saving data'});
												}
												else{
												res.send({"status":"success" , 'msg': 'Details are saved successfully'});
												}
											})
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});
};


exports.getFriends=function(req,res){
	var friends;
	var friendsWaiting;
	var friendsRequesting;
	if(req.session.email){
		var get_friends_query="select * from friends where emailID='"+req.session.email+"' AND status='Friend'";
		mysql.getDataFromDatabase(get_friends_query,function(err,results){
			if(err){
				
			}
			else{
				friends=results;
				console.log(friends);
				var get_friends_waiting_query="select * from friends where emailID='"+req.session.email+"' AND status='Waiting'";
				mysql.getDataFromDatabase(get_friends_waiting_query,function(err,results){
					if(err){
						
					}
					else{
						friendsWaiting=results;
						console.log(friendsWaiting);
						var get_friends_requesting_query="select * from friends where emailID='"+req.session.email+"' AND status='Requesting'";
						mysql.getDataFromDatabase(get_friends_requesting_query,function(err,results){
							if(err){
									
							}
							else{
									friendsRequesting=results;
									res.render('friends',{'username':req.session.username,'friends':friends,'friendsWaiting':friendsWaiting,'friendsRequesting':friendsRequesting});
							}
						});
					}
				})
			}
		});
	}
	else{
		res.redirect('/');
	}
};

exports.addFriend=function(req,res){
	var json_responses;
	if(req.session.email){
		var friend=req.param("friend");
		var getEmailFriend_query="select firstName,lastName,email from userprofile where FirstName="+connection.escape(friend)+"";
		mysql.getDataFromDatabase(getEmailFriend_query,function(err,results){
			if(err){
				res.send({"status":"fail" , 'msg': 'Error in retrieving data'});
			}
			else{
				console.log(results[0])
				if(results.length>0){
					var friendEmailID=results[0].email;
					console.log("friend email ID found"+friendEmailID);
					var search_friend_query="select * from friends where emailID='"+req.session.email+"' AND friendEmailID='"+friendEmailID+"'";
					mysql.getDataFromDatabase(search_friend_query,function(err,results){
						if(err){
							res.send({"status":"fail" , 'msg': 'Error in retrieving data'});
						}
						else{
							if(results.length>0){
								var status=results[0].status;
								console.log("friend email ID found in friend table");
								if(status=="Waiting"){
									console.log("waiting");
									res.send({"status":"waiting" , 'msg': 'Request Awaiting'});
								}
								else if(status=="Friend"){
									console.log("already friends");
									res.send({"status":"FriendAlready" , 'msg': 'Friend Already'});
								}
							}
							else{
								var status="Waiting";
								console.log("new friend.waiting status");
								var friend_insert_query="insert into friends values(?,?,?,?)";
								var params=[req.session.email,friendEmailID,status,friend];
								mysql.insertDatatoDatabase(friend_insert_query,params,function(err,results){
									if(err){
										res.send({"status":"fail" , 'msg': 'Error in retrieving data'});
									}
									else{
										var status="Requesting";
										console.log("requested friend db entry");
										var friend_insert_request_query="insert into friends values(?,?,?,?)";
										console.log(friendEmailID+" "+req.session.username+" "+status+" "+req.session.username);
										var params=[friendEmailID,req.session.email,status,req.session.username];
										mysql.insertDatatoDatabase(friend_insert_request_query,params,function(err,results){
											if(err){
												res.send({"status":"fail" , 'msg': 'Error in retrieving data'});
											}
											else{
												console.log("inserting frnd request data to friend database");
												res.send({"status":"Request Sent" , 'msg': 'Friend Already'});
											}
										});
									}
								});
							}
						}
					});
				}
				else{
					console.log("friend name doesnt exist in database");
					res.send({"status":"Email Does not Exists" , 'msg': 'Friend Already'});
				}
			}
		});
	}
	else{
		res.redirect('/');
	}
};

exports.newsfeedSave=function(req,res){
	if(req.session.email){
		var post=req.param("post");
		var getfirstName_query="select firstName from userprofile where email='"+req.session.email+"'";
		mysql.getDataFromDatabase(getfirstName_query,function(err,results){
			if(err){
				res.send({"status":"fail" , 'msg': 'Internal error'});
			}
			else{
				if(results.length>0){
					var firstName=results[0].firstName;
					var date=new Date();
					var insert_post_query="insert into newsfeed values(?,?,?,?);";
					var params=[req.session.email,post,firstName,date];
					mysql.insertDatatoDatabase(insert_post_query,params,function(err,results){
						if(err){
							res.send({"status":"fail" , 'msg': 'Internal error'});
						}
						else{
							console.log("inserting data to post database");
							res.send({"status":"success" , 'msg': 'successfully posted'});
						}
					});
				}
				
			}
		});
	}else{
		res.redirect('/');
	}
};

exports.redirectToEditProfile=function(req,res){
	if(req.session.email){
		var summary;
		var education;
		var work;
		var contact;
		var lifeevents;
		var music;
		var shows;
		var sports;
		var selectQuery = "select * from userprofile where email ='"+req.session.email+"'";
		mysql.getDataFromDatabase(selectQuery,function(err,results){
			if(err){
				console.log("error occured while getting details for email id");
			}
			else{
				console.log("data retrieved from userprofile table"+results);
				summary = results[0].overview;
				var work_query = "select * from work where emailid ='"+req.session.email+"'";
				mysql.getDataFromDatabase(work_query,function(err,results){
					if(err){
						console.log("error while getting details from work table");
					}
					else{
						console.log("data retrieved from work table");
						for(var i=0;i<results.length;i++){
							console.log(results[i]);
						}
						work=results;
						var edu_query="select * from education where emailid ='"+req.session.email+"'";
						mysql.getDataFromDatabase(edu_query,function(err,results){
							if(err){
								console.log("error while getting details from education table");
							}
							else{
								console.log("data retrieved from education table");
								for(var i=0;i<results.length;i++){
									console.log(results[i]);
								}
								education=results;
								var contact_query="select * from contacts where emailid ='"+req.session.email+"'";
								mysql.getDataFromDatabase(contact_query,function(err,results){
									if(err){
										console.log("error while getting details from contacts table");
									}
									else{
										console.log("data retrieved from contact table");
										for(var i=0;i<results.length;i++){
											console.log(results[i]);
										}
										contact=results;
										var lifeevents_query="select * from lifeevents where emailid ='"+req.session.email+"'";
										mysql.getDataFromDatabase(lifeevents_query,function(err,results){
											if(err){
												console.log("error while getting details from lifeevents table");
											}
											else{
												console.log("data retrieved from life table");
												for(var i=0;i<results.length;i++){
													console.log(results[i]);
												}
												lifeevents=results;
												var interests_query="select * from interests where email='"+req.session.email+"'";
												mysql.getDataFromDatabase(interests_query, function(err, results) {
													if(err){
														console.log("error while getting details from contacts table");
													}
													else{
														music=results[0].music;
														shows=results[0].shows;
														sports=results[0].sports;
														res.render("editProfile",{'username':req.session.username,'summary':summary,'work':work,'education':education,'contact':contact,'lifeevents':lifeevents,'music':music,'shows':shows,'sports':sports});
													}
												});
											}
										});
									}
								});
							}
						});
					}
				});
			}
		});
	}
	else{
		res.redirect('/');
	}
};


exports.redirectToViewProfile=function(req,res){
	if(req.session.email){
		var summary;
		var education;
		var work;
		var contact;
		var lifeevents;
		var music;
		var shows;
		var sports;
		var selectQuery = "select * from userprofile where email ='"+req.session.email+"'";
		mysql.getDataFromDatabase(selectQuery,function(err,results){
			if(err){
				console.log("error occured while getting details for email id");
			}
			else{
				console.log("data retrieved from userprofile table"+results);
				summary = results[0].overview;
				var work_query = "select * from work where emailid ='"+req.session.email+"'";
				mysql.getDataFromDatabase(work_query,function(err,results){
					if(err){
						console.log("error while getting details from work table");
					}
					else{
						console.log("data retrieved from work table");
						for(var i=0;i<results.length;i++){
							console.log(results[i]);
						}
						work=results;
						var edu_query="select * from education where emailid ='"+req.session.email+"'";
						mysql.getDataFromDatabase(edu_query,function(err,results){
							if(err){
								console.log("error while getting details from education table");
							}
							else{
								console.log("data retrieved from education table");
								for(var i=0;i<results.length;i++){
									console.log(results[i]);
								}
								education=results;
								var contact_query="select * from contacts where emailid ='"+req.session.email+"'";
								mysql.getDataFromDatabase(contact_query,function(err,results){
									if(err){
										console.log("error while getting details from contacts table")
									}
									else{
										console.log("data retrieved from contact table");
										for (var i = 0; i <results.length;i++){
											console.log(results[i]);
										}
										contact=results;
										var lifeevents_query="select * from lifeevents where emailid ='"+req.session.email+"'";
										mysql.getDataFromDatabase(lifeevents_query,function(err,results){
											if(err){
												console.log("error while getting details from lifeevents table");
											}
											else{
												console.log("data retrieved from life table");
												for(var i=0;i<results.length;i++){
													console.log(results[i]);
												}
												lifeevents=results;
												var interests_query="select * from interests where email='"+req.session.email+"'";
												mysql.getDataFromDatabase(interests_query, function(err, results) {
													if(err){
														console.log("error while getting details from interests table");
													}
													else{
														music=results[0].music;
														shows=results[0].shows;
														sports=results[0].sports;
														res.render("viewProfile",{'username':req.session.username,'summary':summary,'work':work,'education':education,'contact':contact,'lifeevents':lifeevents,'music':music,'shows':shows,'sports':sports});
													}
												});
											}
										});
									}
								});
							}
						});
					}
				});
			}
		});
	}
	else{
		res.redirect('/');
	}
};

exports.acceptedRequest=function(req,res){
	if(req.session.email){
		var name=req.param("name");
		var email=req.param("emailid");
		var set_waitingtoFriend_query="update friends set status='Friend' where emailID=? AND friendEmailID=?";
		var params=[req.session.email,email];
		mysql.insertDatatoDatabase(set_waitingtoFriend_query, params, function(err, results) {
			if(err){
				json_responses = {"statusCode" : 200};
				res.send(json_responses); 
			}
			else{
				var set_requestingtoFriend_query="update friends set status='Friend' where emailID=? AND friendEmailID=?";
				var params=[email,req.session.email];
				mysql.insertDatatoDatabase(set_requestingtoFriend_query, params, function(err, results) {
					if(err){
						json_responses = {"statusCode" : 200};
						res.send(json_responses); 
					}
					else{
						json_responses = {"statusCode" : 201};
						res.send(json_responses); 
					}
				})
			}
		})
	}
	else{
		res.redirect('/');
	}
}

exports.redirectToGroups=function(req,res){
	if(req.session.email){
		var admin;
		var member;
		var get_groupadmin_query="select * from groups where groupadmin='Yes' and groupmembers='"+req.session.email+"'";
		mysql.getDataFromDatabase(get_groupadmin_query, function(err, results) {
			if(err){
				res.render("error");
			}else{
				admin=results;
				console.log(admin);
				var get_groupmember_query="select * from groups where groupadmin='No' and groupmembers='"+req.session.email+"'";
				mysql.getDataFromDatabase(get_groupmember_query, function(err, results) {
					if(err){
						res.render("error");
					}
					else{
						member=results;
						console.log(results);
						res.render("groups",{'admin':admin,'members':member,'username':req.session.username});
					}
					
				})
			}
		})
	}
	else{
		res.redirect('/');
	}
};

exports.redirectToCreateGroup=function(req,res){
	if(req.session.email){
		var friendsList;
		get_friends_query="select firstname,friendEmailID from friends where emailID='"+req.session.email+"' and status='Friend'";
		mysql.getDataFromDatabase(get_friends_query, function(err, results) {
			if(err){
				
			}
			else{
				friendsList=results;
				console.log(friendsList);
				var get_groups_query="select * from groups where groupmembers='"+req.session.email+"'";
				mysql.getDataFromDatabase(get_groups_query, function(err, results) {
					if(err){
						
					}
					else{
						var groups=results;
						res.render("createGroup",{"friendsList":friendsList,'username':req.session.username,'groups':groups});
					}
				})
			}
		})
	}
	else{
		res.redirect('/');
	}
};

exports.createGroup=function(req,res){
	if(req.session.email){
		var creategroup_query="insert into groups values";
		var members=req.param("members");
		var groupName=req.param("groupName");
		creategroup_query+="(?,'Yes',?,?),";
		var searchgroup_query="select * from groups where groupname='"+groupName+"'";
		mysql.getDataFromDatabase(searchgroup_query, function(err, results) {
			if(results.length>0){
				res.send({"status":"fail" , 'msg': 'Group already present'});
			}
			else{
				for(var i=0;i<members.length;i++){
					console.log(members[i].firstname+""+members[i].email);
					creategroup_query+="('"+groupName+"','No','"+members[i].email+"','"+members[i].firstname+"'),";
				}
				creategroup_query=creategroup_query.substring(0,creategroup_query.length-1);
				params=[groupName,req.session.email,req.session.username];
				mysql.insertDatatoDatabase(creategroup_query, params, function(err, results) {
					if(err){
						res.send({"status":"fail" , 'msg': 'Error in creating groups.Please try again later'});
					}else{
						res.send({"status":"success" , 'msg': 'Group created successfully'});
					}
				})
			}
		})
	}
	else{
		res.redirect('/');
	}
};

exports.redirectToDeleteGroup=function(req,res){
	if(req.session.email){
		var group_admin;
		var get_groups_admin_query="select * from groups where groupmembers='"+req.session.email+"' AND groupadmin='Yes'";
		mysql.getDataFromDatabase(get_groups_admin_query, function(err, results) {
			if(err){
				
			}
			else{
				group_admin=results;
				console.log(group_admin);
				var get_groups_query="select * from groups where groupmembers='"+req.session.email+"'";
				mysql.getDataFromDatabase(get_groups_query, function(err, results) {
					if(err){
						
					}
					else{
						res.render("deleteGroup",{'group_admin':group_admin,'username':req.session.username,'groups':results});
					}
				});
			}
		})
	}
	else{
		res.redirect('/');
	}
}

exports.deleteGroup=function(req,res){
	if(req.session.email){
		var group_name=req.param("groupname");
		console.log('Group Name',group_name);
		
		group_delete_query="delete from groups where groupname='"+group_name+"'";
		console.log(group_delete_query.sql);
		mysql.execQuery(group_delete_query,function(err,results){
			if(err){
				console.log("error");
				return "error";
			}
			else{
				var location='/deleteGroup'
				res.redirect(location);
			}
		})
	}
	else{
		res.redirect('/');
	}
}

exports.redirectToViewGroup=function(req,res){
	if(req.session.email){
			var groupMembers;
			var groupName=req.param('groupName');
			var get_groupMembers_query="select * from groups where groupname='"+groupName+"'";
			mysql.getDataFromDatabase(get_groupMembers_query, function(err, results) {
				if(err){
					
				}
				else{
					if(results.length>0){
						groupMembers=results;
						console.log(groupMembers);
						var get_groups_query="select * from groups where groupmembers='"+req.session.email+"'";
						var groups;
						mysql.getDataFromDatabase(get_groups_query, function(err, results) {
							if(err){
								
							}
							else{
								groups=results;
								res.render("viewGroup",{'groupName':groupName,'groupMembers':groupMembers,'username':req.session.username,'groups':groups});
							}
						})
					}
				}
			})
	}
	else{
		res.redirect('/');
	}
};

exports.deleteMemberFromGroup=function(req,res){
	if(req.session.email){
		var groupMember = req.param("member");
		var groupName = req.param("groupName");
		var groupMember_deleteQuery="delete from groups where groupname='"+groupName+"' AND groupmembers='"+groupMember+"'";
		mysql.execQuery(groupMember_deleteQuery, function(err, results) {
			if(err){
				res.redirect('/');
			}
			else{
				var location='/viewGroup?groupName='+groupName;
				res.redirect(location);
			}
		});
	}
};

exports.redirectToSignup=function(req,res){
	res.render("Signup");
};

exports.storeUserDetails=function(req,res){
	if(req.session.email){
		var summary=req.param("summary");
		var work=req.param("work");
		var education=req.param("education");
		var contact=req.param("contact");
		var lifeevents=req.param("lifeevents");
		var music=req.param("music");
		var shows=req.param("shows");
		var sports=req.param("sports");
		var insert_summary_query="update userprofile set overview=? where email=?";
		var params = [summary,req.session.email];
		mysql.insertDatatoDatabase(insert_summary_query,params,function(err,results){
			if(err){
				res.send({"status":"fail" , 'msg': 'error in updating details in userprofile table'});
			}
			else{
				var insert_work_query="update work set work=? where emailid=?";
				var params = [work,req.session.email];
				mysql.insertDatatoDatabase(insert_work_query,params,function(err,results){
					if(err){
						res.send({"status":"fail" , 'msg': 'error in updating details in work table'});
					}
					else{
						var insert_education_query="update education set education=? where emailid=?";
						var params=[education,req.session.email];
						mysql.insertDatatoDatabase(insert_education_query,params,function(err,results){
							if(err){
								res.send({"status":"fail" , 'msg': 'error in updating details in education table'});
							}
							else{
								var insert_contact_query="update contacts set contact=? where emailid=?";
								var params=[contact,req.session.email];
								mysql.insertDatatoDatabase(insert_contact_query,params,function(err,results){
									if(err){
										res.send({"status":"fail" , 'msg': 'error in updating details in contact table'});
									}
									else{
										var insert_lifeevents_query="update lifeevents set lifeevents=? where emailid=?";
										var params=[lifeevents,req.session.email];
										mysql.insertDatatoDatabase(insert_lifeevents_query,params,function(err,results){
											if(err){
												res.send({"status":"fail" , 'msg': 'error in updating details in lifeevents table'});
											}
											else{
												var insert_interests_query="update interests set music=?,shows=?,sports=? where email=?";
												var params=[music,shows,sports,req.session.email];
												mysql.insertDatatoDatabase(insert_interests_query, params, function(err, results) {
													if(err){
														res.send({"status":"fail" , 'msg': 'error in updating details in lifeevents table'});
													}
													else{
														res.send({"status":"success" , 'msg': 'Data saved successfully'});
													}
												});
											}
										});
									}
								});
							}
						});
					}
				});
			}
		});
	}
	else{
		res.redirect('/');
	}
};
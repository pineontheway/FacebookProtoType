
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , login = require('./routes/login')
  , path = require('path')
  , signup = require('./routes/signup')
  //Importing the 'client-sessions' module
  , session = require('client-sessions');
var mysql = require('./routes/sql');
var app = express();

// all environments
//configure the sessions with our application
app.use(session({   
	  
	cookieName: 'session',    
	secret: 'sai_facebook_application',    
	duration: 30 * 60 * 1000,    
	activeDuration: 5 * 60 * 1000,  }));
app.set('port', process.env.PORT || 3001);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

//GET
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/homepage',login.redirectToHomepage);
app.get('/editProfile',login.redirectToEditProfile);
app.get('/viewProfile',login.redirectToViewProfile);
app.get('/groups',login.redirectToGroups);
app.get('/createGroup',login.redirectToCreateGroup);
app.get('/deleteGroup',login.redirectToDeleteGroup);
app.get('/viewGroup',login.redirectToViewGroup);
app.get('/groups/viewGroup',login.redirectToViewGroup);
app.get('/gettingStarted',login.gettingStarted);
app.get('/friends',login.getFriends);
app.get('/signup',login.redirectToSignup);
app.get('/logout',login.logout);
//POST
app.post('/checklogin',login.checklogin);
app.post('/logout',login.logout);
app.post('/usersignup',login.usersignup);
app.post('/storePersonalData',login.storePersonalData)
app.post('/addFriend',login.addFriend);
app.post('/postNewsfeed',login.newsfeedSave);
app.post('/acceptedRequest',login.acceptedRequest);
app.post('/createGroup',login.createGroup);
app.post('/deleteGroup',login.deleteGroup);
app.post('/deleteMemberFromGroup',login.deleteMemberFromGroup);
app.post('/editProfileAftersignin',login.storeUserDetails);
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

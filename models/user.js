var //_ = require('underscore'),
	path = require('path'),
	fs = require('fs'),
	RSVP = require('rsvp'),
	_ = require('underscore'),
	colog = require('colog'),
	config = require(path.resolve(__dirname,'../lib/oauth2-config.js')),
	goauth2 = require('google-oauth2')(config),
	//OAuth = require(path.resolve(__dirname,'../node_modules/google-oauth/GoogleOAuth')),
	pivotalDataAccess = require(path.resolve(__dirname,'../dataAccess/pivotal_data_access.js')),
	dataAccess = require(path.resolve(__dirname, '../dataAccess/apitt_data_access.js'));

var USER_LOGIN = '/login/create.json',
	GET_CLIENTS = '/users/get_clients.json?id=',
	PERIOD = '/users/get_actual_period.json?id=';

var scope = "https://www.googleapis.com/auth/userinfo.profile";


var user = {

	//googleLogin: function (){
	login: function (){
		var promise = new RSVP.Promise(function(resolve, reject){
			goauth2.getAuthCode(scope, function(err, auth_code){
				console.log(auth_code);
				console.log(err);
				if(!err){
					resolve(auth_code);
				}
				else
				{
					reject(err);
				}
			});
		});
		return promise;
/*		var oauth = new OAuth.OAuth2(
			'606947730010.apps.googleusercontent.com',
			'8GDk4I2SRnLD2PugicAgrvE7',
			'http://localhost:8082/authentication');

		server.get('/authentication', function(req, res){

			if(!req.query.code){
				//Redirect the user to Authentication From,
				// Set authentication scope to google calendar api
				oauth.getGoogleAuthorizeTokenURL( ['https://www.googleapis.com/auth/userinfo.email'], function(err, redirecUrl) {
					if(err)
					{
						return res.send(500,err);
					}
					return res.redirect(redirecUrl);
				});

			}else{
				//Get access_token from the code
				oauth.getGoogleAccessToken(req.query, function(err, access_token, refresh_token) {
					if(err){
						return res.send(500,err);
					}
					req.session.access_token = access_token;
					req.session.refresh_token = refresh_token;
					return res.redirect('/');
				});
			}
		});
	*/
	},

	/*puser: email of the user
	ppassword: encrypted password of the user
	gets the information of the user in the Timetracker*/
	login2: function(puser, ppassword){
		var message	= {
				email: puser,
				password: ppassword
			};
		return dataAccess.post(USER_LOGIN, message);
	},

	/* puserId: id of the user
	get the clients of an user
	*/
	getClients: function(puserId){
		var message	=  GET_CLIENTS + puserId;
		return dataAccess.get(message);
	},

	/* pusedId: id of the user
	get the actual period of an user
	*/
	getPeriod: function(pusedId){
		var message	=  PERIOD + pusedId;
		return dataAccess.get(message);
	},

	/* puser: information of the user
	returns the token of pivotal */
	pivotalLogin: function (puser){
		var ME = 'me';
		return pivotalDataAccess.login(puser, ME);
	}

};
module.exports = user;
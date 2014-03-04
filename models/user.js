var //_ = require('underscore'),
	path = require('path'),
	fs = require('fs'),
	dataAccess = require(path.resolve(__dirname, '../dataAccess/apitt_data_access.js'));

var USER_LOGIN = '/login/create.json';

var user = {

	/*puser: email of the user
	ppassword: encrypted password of the user
	pfunction: function to do next
	gets the information of the user*/
	login: function(puser, ppassword, pfunction){
		var message	= {
				email: puser,
				password: ppassword
			};
		dataAccess.post(USER_LOGIN, message, pfunction);
	}

};
module.exports = user;
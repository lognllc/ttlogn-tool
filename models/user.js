var //_ = require('underscore'),
	path = require('path'),
	fs = require('fs'),
	dataAccess = require('../dataAccess/apitt_data_access.js');

var USER_LOGIN = '/login/create.json';
//	PASSWORD = '&password=';

var user = {

	login: function(puser, ppassword, pfunction){
		var message	= {
				email: puser,
				password: ppassword
			};
		dataAccess.post(USER_LOGIN, message, pfunction);
	}

};
module.exports = user;
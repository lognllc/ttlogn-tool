var //_ = require('underscore'),
	path = require('path'),
	fs = require('fs'),
	dataAccess = require('../dataAccess/apitt_data_access.js');

var USER_LOGIN = '/login/create.json?email=',
	PASSWORD = '&password=';

var user = {

	login: function(puser, ppassword, pfunction){
		var message	= USER_LOGIN + puser + PASSWORD + ppassword;
		dataAccess.post(message, pfunction);
	}

};
module.exports = user;
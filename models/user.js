var //_ = require('underscore'),
	path = require('path'),
	fs = require('fs'),
	dataAccess = require('../dataAccess/apitt_data_access.js');
	utils = require('../lib/utils.js');

var USER_LOGIN = '/login/create?email=',
	PASSWORD = 'password';

var user = {

	login: function(puser){
		var message	= USER_LOGIN + puser.email + PASSWORD + puserPassword;
		dataAccess.post(message,'function');

	}

	/*getUserId: function(puser){

	}*/

};

module.exports = user;
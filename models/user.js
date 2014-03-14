var //_ = require('underscore'),
	path = require('path'),
	fs = require('fs'),
	dataAccess = require(path.resolve(__dirname, '../dataAccess/apitt_data_access.js'));

var USER_LOGIN = '/login/create.json',
	GET_CLIENTS = '/users/get_clients.json?id=';




var user = {

	/*puser: email of the user
	ppassword: encrypted password of the user
	pfunction: function to do next
	gets the information of the user*/
	login: function(puser, ppassword){
		var message	= {
				email: puser,
				password: ppassword
			};
		return dataAccess.post(USER_LOGIN, message);
	},

	/* puserId: id of the user
	pfunction: funtion to send the projects
	get the projects of an user
	*/
	getClients: function(puserId){
		var message	=  GET_CLIENTS + puserId;
		return dataAccess.get(message);
	}

};
module.exports = user;
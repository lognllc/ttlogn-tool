var //_ = require('underscore'),
	path = require('path'),
	fs = require('fs'),
	RSVP = require('rsvp'),
	_ = require('underscore'),
	colog = require('colog'),
	pivotalDataAccess = require(path.resolve(__dirname,'../dataAccess/pivotal_data_access.js')),
	dataAccess = require(path.resolve(__dirname, '../dataAccess/apitt_data_access.js'));

var USER_LOGIN = '/login/create.json',
	GET_CLIENTS = '/users/get_clients.json?id=';


var user = {

	/*puser: email of the user
	ppassword: encrypted password of the user
	gets the information of the user in the Timetracker*/
	login: function(puser, ppassword){
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

	/* puser: information of the user
	returns the token of pivotal */
	pivotalLogin: function (puser){
		var ME = 'me';
		return pivotalDataAccess.login(puser, ME);
	}

};
module.exports = user;
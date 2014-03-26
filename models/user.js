var //_ = require('underscore'),
	path = require('path'),
	fs = require('fs'),
	pivotal = require('pivotal'),
	RSVP = require('rsvp'),
	_ = require('underscore'),
	colog = require('colog'),
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
	pivotalLogin: function (puser)
	{	var promise = new RSVP.Promise(function(resolve, reject){
			var self = this;
			pivotal.getToken(puser.pivotalEmail, puser.pivotalPassword, function(err, ret){
				if(!err){
					resolve(ret.guid);
				}
				else{
					colog.log(colog.colorRed('Error: Something went wrong on the request: ' + err.desc));
					reject(self);
				}
			});

		});
		return promise;
	},

	/* puser: email of the user,
	pmemberships: memberships of a project
	returns the information of an user */
	getPivotalUser: function (puser, pmemberships)
	{	var pivotalUser = _.find(pmemberships, function(membership){ return puser === membership.person.email; });
		return pivotalUser.person.name;
	},

};
module.exports = user;
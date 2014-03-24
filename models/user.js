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
	},

	/* ppath: path of the directory
	return the directory */
	pivotalLogin: function (puser)
	{	var promise = new RSVP.Promise(function(resolve, reject){
			var self = this;
			pivotal.getToken(puser.email, puser.password, function(err, ret){
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

	getPivotalUser: function (puser, pmemberships)
	{	var pivotalUser = _.find(pmemberships, function(membership){ return puser.email === membership.person.email; });
		return pivotalUser.person.name;
	},

};
module.exports = user;
var //_ = require('underscore'),
	path = require('path'),
	pivotal = require('pivotal'),
	RSVP = require('rsvp'),
	colog = require('colog'),
	dataAccess = require(path.resolve(__dirname,'../dataAccess/apitt_data_access.js'));

var PROJECT = '/users/projects.json?id=';

var project = {

	/* puserId: id of the user
	pfunction: funtion to send the projects
	get the projects of an user
	*/
	getProjects: function(puserId){
		var message	=  PROJECT + puserId;
		return dataAccess.get(message);
	},

	// returns the limit date
	getPivotalProjects: function(puser){
		var promise = new RSVP.Promise(function(resolve, reject){
			var self = this;
			
			pivotal.useToken(puser);
			pivotal.getProjects(function(err, ret){
				if(!err){
					resolve(ret);
				}
				else{
					colog.log(colog.colorRed('Error: Something went wrong on the request: ' + err.desc));
					reject(self);
				}
			});
		});
		return promise;
	}
};

module.exports = project;
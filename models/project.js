var //_ = require('underscore'),
	path = require('path'),
	pivotal = require('pivotal'),
	RSVP = require('rsvp'),
	_ = require('underscore'),
	colog = require('colog'),
	dataAccess = require(path.resolve(__dirname,'../dataAccess/apitt_data_access.js')),
	pivotalDataAccess = require(path.resolve(__dirname,'../dataAccess/pivotal_data_access.js'));

var PROJECT = '/users/projects.json?id=',
	PIVOTAL_PROJECT = 'projects/';

var project = {

	/* puserId: id of the user
	get the projects of an user
	*/
	getProjects: function(puserId){
		var message	=  PROJECT + puserId;
		return dataAccess.get(message);
	},

	/* puserId: id of the user
	get the projects of an user
	*/
	getPivotalProject: function(puserId, pprojectId){
		var message	=  PIVOTAL_PROJECT + pprojectId;
		return pivotalDataAccess.get(puserId, message);
	}
};

module.exports = project;
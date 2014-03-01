var //_ = require('underscore'),
	dataAccess = require('../dataAccess/apitt_data_access.js');

var GET_PROJECTS = '/users/projects.json?id=';

var project = {

	/* puserId: id of the user
	pfunction: funtion to send the projects
	get the projects of an user
	*/
	getProjects: function(puserId, pfunction){
		var message	=  GET_PROJECTS + puserId;
		dataAccess.get(message, pfunction);
	}

};

module.exports = project;
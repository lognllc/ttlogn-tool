var //_ = require('underscore'),
	dataAccess = require('../dataAccess/apitt_data_access.js');

var GET_PROJECTS = '/users/projects.json?id=';

var project = {

	getProjects: function(puserId){
		var message	=  GET_PROJECTS + puserId;
		dataAccess.get(message,'function');
	}

};

module.exports = project;
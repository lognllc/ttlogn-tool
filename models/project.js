var //_ = require('underscore'),
	path = require('path'),
	dataAccess = require(path.resolve(__dirname,'../dataAccess/apitt_data_access.js'));

var PROJECT = '/users/projects.json?id=';

var project = {

	/* puserId: id of the user
	pfunction: funtion to send the projects
	get the projects of an user
	*/
	getProjects: function(puserId, pfunction){
		var message	=  PROJECT + puserId;
		dataAccess.get(message, pfunction);
	},

	/* puserId: id of the user
	pfunction: funtion to send the projects
	get the projects of an user
	*/
	getClients: function(pprojectId, pfunction){
		var message	=  PROJECT + puserId;
		dataAccess.get(message, pfunction);
	}
};

module.exports = project;
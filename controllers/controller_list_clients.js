var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	moment = require('moment'),
	prompt = require('prompt'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	timeEntry = require(path.resolve(__dirname,'../models/time_entry.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	project = require(path.resolve(__dirname,'../models/project.js')),
	hourType = require(path.resolve(__dirname,'../models/hour_type.js'));

var PROJECT = /^\d+$/;

/*pprojects: projects of the user to display
prints the projects, get hour type*/
var printProject = function(pprojects){
	userId = puser.result.id;
	userType = puser.result.devtype;

	colog.log(colog.colorMagenta('Select a project: '));
	_.each(pprojects.result, function(value, index){
		index ++;
		colog.log(colog.colorBlue(index + ': ' + value.name));
	});
	projects = pprojects.result;
	hourType.getHourType(userId, getBillable);
};

/* puser: user data in the TT
sets the user data and get hour types
*/
var getProjects = function(puser){
	project.getProjects(puser.result.id, printProject);
};

var controllerListClients = {

	/*saves a task of an user in the TT*/
	saveWork: function(){
		var repos = [],
			configuration = config.getConfig();
	
		if(config.existConfig){
			user.login(configuration.email, configuration.password, getProjects);
		}
		else{
			colog.log(colog.colorRed("Error: Configuration file doesn't exist"));
		}
	}
};

module.exports = controllerListClients;

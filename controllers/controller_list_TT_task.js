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

var FORMATHOUR = /^\d+(|\.\d+)h$/i,
	DIGITS = /[^h]+/i,
	PROJECT = /^\d+$/,
	TIME_IN = /^[0-2]\d\:[0-6]\d$/;

/*pproyects: projects of the user to display
prints the projects, get hour type*/
var printTimeEntries = function(pentries){
	console.log(pentries.result.not_confirmed_dates);
};

/* puser: user data in the TT
sets the user data and get hour types
*/
var getTimeEntries = function(puser){
	userId = puser.result.id;
	userType = puser.result.devtype;
	timeEntry.getUserPeriodTimeEntry(userId, printRepo);
};

var controllerModifyTask = {

	/*saves a task of an user in the TT*/
	modifyWork: function(){
		var repos = [],
			configuration = config.getConfig();
	
		if(config.existConfig){
			user.login(configuration.email, configuration.password, getHourType);
		}
		else{
			colog.log(colog.colorRed("Error: Configuration file doesn't exist"));
		}
	}
};

module.exports = controllerModifyTask;

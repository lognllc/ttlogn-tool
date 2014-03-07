var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	moment = require('moment-timezone'),
	prompt = require('prompt'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	timeEntry = require(path.resolve(__dirname,'../models/time_entry.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	project = require(path.resolve(__dirname,'../models/project.js')),
	hourType = require(path.resolve(__dirname,'../models/hour_type.js'));

var FORMATHOUR = /^\d+(|\.\d+)h$/i,
	DIGITS = /[^h]+/i,
	PROJECT = /^\d+$/,
	FIELD = /^[0-6]$/,
	CREATED = /^\d\d$/,
	TIME_IN = /^[0-2]\d\:[0-6]\d$/,
	DATE_FORMAT = 'YYYY-MM-DD hh:mm:ss';

var userId = 0,
	userType = '',
	projects = [];


/*pentries: projects of the user to display
set the projects, get hour type*/
var deleteTimeEntry = function(pentries){
	
	prompt.get({
		properties: {
			entry: {
				description: "Number of the entry".magenta,
				required: true,
				pattern: PROJECT
			}
		}
	}, function (err, resultPrompt) {

		var entryToDelete = {
				entry_id: pentries[resultPrompt.entry].id,
				devtype: userType,
				user_id: userId
			};
		console.log(entryToDelete);
		timeEntry.postTimeEntry(entryToDelete).then(function(){
			colog.log(colog.colorGreen('Time entry saved'));
		});
	});
};

/*pentries: entries of the user unconfirm in this period to display
prints the entries*/
var printTimeEntries = function(pentries){
	
	prompt.start();
	prompt.get({
		properties: {
			project: {
				description: "Number of the project".magenta,
				required: true,
				pattern: PROJECT
			}
		}
	}, function (err, resultPrompt) {
		var timeEntries = _.filter(pentries.result.not_confirmed_dates, function(entries){ return entries.project.id === projects[resultPrompt.project].id; }),
			date = moment();

		colog.log(colog.colorMagenta('Select a time entry: '));
		_.each(timeEntries, function(value, index){
			date = moment.utc(value.created); //.format('DD-MM-YYYY hh:mm:ss');
			date = date.format('l');
			colog.log(colog.colorBlue(index + ': ' + value.tskDescription + '. Date: ' + date));
		});
		deleteTimeEntry(timeEntries);
	});
};

/* gets the entries of the user unconfirm in this period to display
*/
var getTimeEntries = function(){
	timeEntry.getUserPeriodTimeEntry(userId, printTimeEntries);
};

/*pprojects: projects of the user to display
prints the projects, get hour type*/
var printProjects = function(pprojects){
	//console.log(pentries.result.not_confirmed_dates);
	colog.log(colog.colorMagenta('Select a project: '));
	_.each(pprojects.result, function(value, index){
		colog.log(colog.colorBlue(index + ': ' + value.name));
	});
	projects = pprojects.result;
	getTimeEntries();
};

/* puser: user data in the TT
sets the user data and get hour types
*/
var getProjects = function(puser){
	userId = puser.result.id;
	userType = puser.result.devtype;
	project.getProjects(puser.result.id, printProjects);
};

var controllerDeleteTask = {

	/*deletes a task of an user in the TT*/
	deleteWork: function(){
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

module.exports = controllerDeleteTask;

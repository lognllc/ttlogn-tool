var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	moment = require('moment-timezone'),
	prompt = require('prompt'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	timeEntry = require(path.resolve(__dirname,'../models/time_entry.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	project = require(path.resolve(__dirname,'../models/project.js'));

var DIGITS = /[^h]+/i,
	NUMBER = /^\d+$/;

/*pentries: projects of the user to display
set the projects, get hour type*/
var deleteTimeEntry = function(puser, pentries){
	
	prompt.get({
		properties: {
			entry: {
				description: "Number of the entry".magenta,
				required: true,
				pattern: NUMBER
			}
		}
	}, function (err, resultPrompt) {

		var entryToDelete = {
				entry_id: pentries[resultPrompt.entry - 1].id,
				devtype: puser.devtype,
				user_id: puser.id
			};
		//	console.log(entryToDelete);
		timeEntry.deleteTimeEntry(entryToDelete).then(function(){
			colog.log(colog.colorGreen('Time entry deleted'));
		});
	});
};

/*pentries: entries of the user unconfirm in this period to display
prints the entries*/
var printTimeEntries = function(puser, pprojects, pentries){
	
	prompt.start();
	prompt.get({
		properties: {
			project: {
				description: "Number of the project".magenta,
				required: true,
				pattern: NUMBER
			}
		}
	}, function (err, resultPrompt) {
		var timeEntries = _.filter(pentries, function(entries){ return entries.project.id === pprojects[resultPrompt.project - 1].id; }),
			date = moment();

		colog.log(colog.colorMagenta('Select a time entry: '));
		_.each(timeEntries, function(value, index){
			date = moment.utc(value.created);
			date = date.format('l');
			index++;
			colog.log(colog.colorBlue(index + ': ' + value.tskDescription + '. Date: ' + date));
		});
		deleteTimeEntry(puser, timeEntries);
	});
};

/*pprojects: projects of the user to display
prints the projects, get hour type*/
var printProjects = function(pprojects){
	colog.log(colog.colorMagenta('Select a project: '));
	_.each(pprojects, function(value, index){
		index++;
		colog.log(colog.colorBlue(index + ': ' + value.name));
	});
};

var controllerDeleteTask = {

	/*deletes a task of an user in the TT*/
	deleteWork: function(){
		var repos = [],
			userInfo = {},
			projects = [],
			configuration = config.getConfig();
	
		if(config.existConfig){
			user.login(configuration.email, configuration.password).then(function(puser){
			//	console.log(puser.result);
				userInfo = puser.result;
				return project.getProjects(userInfo.id);

			}).then(function(pprojects) {
			//	console.log(pprojects.result);
			//	console.log(userInfo.id);
				projects = pprojects.result;
				return timeEntry.getUserPeriodTimeEntry(userInfo.id);

			}).then(function(pentries) {
				printProjects(projects);
				printTimeEntries(userInfo, projects, pentries.result.not_confirmed_dates);

			}).catch(function(error) {
				colog.log(colog.colorRed(error));
			});
		}
		else{
			colog.log(colog.colorRed("Error: Configuration file doesn't exist"));
		}
	}
};

module.exports = controllerDeleteTask;

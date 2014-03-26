var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	moment = require('moment-timezone'),
	prompt = require('prompt'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	timeEntry = require(path.resolve(__dirname,'../models/time_entry.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	utils = require(path.resolve(__dirname,'../lib/utils.js')),
	project = require(path.resolve(__dirname,'../models/project.js'));

var DATE_FORMAT = 'l';

/*
puser: user information
pentry: entry to delete
deletes the time entry
*/
var deleteTimeEntry = function(puser, pentry){
	var entryToDelete = {
			entry_id: pentry.id,
			devtype: puser.devtype,
			user_id: puser.id
		};
		//console.log(entryToDelete);
	utils.getConfirmation(pentry.tskDescription).then(function(){
		return timeEntry.deleteTimeEntry(entryToDelete);
	}).then(function(){
		colog.log(colog.colorGreen('Time entry deleted'));
	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});

};

/*
puser: user information
pproject: project information
prints the entries
*/
var printTimeEntries = function(puser, pproject){
	var cancel = 0,
		timeEntries = [],
		timeEntryToDelete = {},
		date = moment();

	timeEntry.getUserPeriodTimeEntry(puser.id).then(function(entries){
		timeEntries = _.filter(entries.result.not_confirmed_dates, function(pentries)
			{ return pentries.project.id === pproject; });

		utils.printEntries(timeEntries);
		return utils.getPromptTimeEntry(timeEntries);

	}).then(function(pentry){
		deleteTimeEntry(puser, pentry);

	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};


var controllerDeleteEntry = {

	/*
	deletes a task of an user in the TT
	*/
	deleteWork: function(){
		var repos = [],
			userInfo = {},
			projects = [],
			configuration = config.getConfig();
	
		if(config.existConfig){
			user.login(configuration.email, configuration.password).then(function(puser){
				userInfo = puser.result;
				return project.getProjects(userInfo.id);

			}).then(function(pprojects){
				projects = pprojects.result;
				utils.printNames(projects);
				return utils.getPromptProject(projects);

			}).then(function(projectResult){
				printTimeEntries(userInfo, projectResult.id);

			}).catch(function(error) {
				colog.log(colog.colorRed(error));
			});
		}
		else{
			colog.log(colog.colorRed("Error: Configuration file doesn't exist"));
		}
	}
};

module.exports = controllerDeleteEntry;
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

var DATE_FORMAT = 'l',
	NAME = 'name',
	ENTRY_DESCRIPTION = 'tskDescription';

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
	var RESTRICTION_STORY = 'Number of the story';

	var cancel = 0,
		periodEntries = [],
		timeEntryToDelete = {},
		date = moment();

	timeEntry.getUserPeriodTimeEntry(puser.id, pproject).then(function(entries){
		periodEntries = entries.result.not_confirmed_dates.concat(entries.result.confirmed_dates);

		utils.printArray(periodEntries, ENTRY_DESCRIPTION);
		return utils.getPromptNumber(RESTRICTION_STORY, periodEntries);

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
		var RESTRICTION_PROJECT = 'Number of the project';

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
				utils.printArray(projects, NAME);
				return utils.getPromptNumber(RESTRICTION_PROJECT, projects);

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

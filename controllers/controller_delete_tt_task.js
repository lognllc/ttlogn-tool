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

/*pentries: projects of the user to display
set the projects, get hour type*/
var deleteTimeEntry = function(puser, pentry, pentryDescription){
	var entryToDelete = {
			entry_id: pentry,
			devtype: puser.devtype,
			user_id: puser.id
		};
		//console.log(entryToDelete);
	utils.getConfirmation(pentryDescription).then(function(){
		return timeEntry.deleteTimeEntry(entryToDelete);
	}).then(function(){
		colog.log(colog.colorGreen('Time entry deleted'));
	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});

};

/*pentries: entries of the user unconfirm in this period to display
prints the entries*/
var printTimeEntries = function(puser, pproject, pentries){
	var cancel = 0,
		timeEntries = [],
		timeEntryToDelete = {},
		date = moment();

	colog.log(colog.colorMagenta('Select a time entry: '));
	timeEntries = _.filter(pentries, function(entries){ return entries.project.id === pproject; });
		
	_.each(timeEntries, function(value, index){
		date = moment.utc(value.created);
		date = date.format(DATE_FORMAT);
		index++;
		colog.log(colog.colorBlue(index + ': ' + value.tskDescription + '. Date: ' + date));
	});

	cancel = timeEntries.length;
	cancel++;

	colog.log(colog.colorBlue(cancel + ': Cancel'));
	colog.log(colog.colorMagenta('Select a time entry: '));
	
	utils.getPromptTimeEntry().then(function(ptimeEntry){
		if(ptimeEntry < cancel){
			console.log(ptimeEntry);
			timeEntryToDelete = timeEntries[ptimeEntry - 1];//.id;
			console.log(timeEntryToDelete);
			deleteTimeEntry(puser, timeEntryToDelete.id, timeEntryToDelete.tskDescription);
		}
		else{
			process.exit(0);
		}
	}).then(function(ptimeEntry) {
	
	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};

var getProjets = function(puser, pprojects, pentries){
	var cancel = pprojects.length,
		projectId = 0;

	cancel++;
	colog.log(colog.colorBlue(cancel + ': Cancel'));

	utils.getPromptProject().then(function(projectResult){
		if(projectResult < cancel){
			projectId = pprojects[projectResult - 1].id;
			printTimeEntries(puser, projectId, pentries);
		}
		else{
			process.exit(0);
		}
	}).catch(function(error) {
		colog.log(colog.colorRed(error));
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
				userInfo = puser.result;
				return project.getProjects(userInfo.id);

			}).then(function(pprojects) {
				projects = pprojects.result;
				return timeEntry.getUserPeriodTimeEntry(userInfo.id);

			}).then(function(pentries) {
				utils.printNames(projects);
				getProjets(userInfo, projects, pentries.result.not_confirmed_dates);

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

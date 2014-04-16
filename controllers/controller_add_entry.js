var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	moment = require('moment-timezone'),
	prompt = require('prompt'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	timeEntry = require(path.resolve(__dirname,'../models/time_entry.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	detailTime = require(path.resolve(__dirname,'../models/detail_time.js')),
	project = require(path.resolve(__dirname,'../models/project.js')),
	utils = require(path.resolve(__dirname,'../lib/utils.js')),
	hourType = require(path.resolve(__dirname,'../models/hour_type.js'));

var DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss Z',
	NAME = 'name';

/* 
ptask: the task to save
save the task and the detail hour
*/
var saveDetailHour = function(ptask){
	
	utils.getPromptDetailHour().then(function(timeResult){
		detailTime.setDetailTime(ptask, ptask.time, timeResult);
			//console.log(ptask);
			return timeEntry.postTimeEntry(ptask);

	}).then(function() {
		colog.log(colog.colorGreen('Time entry saved'));

	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};

/* 
puser: information of the user
pprojects: information of the projects
ptask: the task to save
save the task
*/
var saveTask = function(ptask, puser, pprojects){
	var RESTRICTION_PROJECT = 'Number of the project',
		RESTRICTION_DESCRIPTION = 'Description';
	
	var project = {};

	utils.getPromptNumber(RESTRICTION_PROJECT, pprojects).then(function(projectResult){
		ptask.project_id = projectResult.id;
		return utils.getPromptText(RESTRICTION_DESCRIPTION);

	}).then(function(pdescription) {
		ptask.description = pdescription;
		return utils.getPromptTime();

	}).then(function(ptime) {
		ptask.time = utils.getWorkedHours(ptime);
		
		if(puser.devtype !== 'non_exempt'){
			timeEntry.postTimeEntry(ptask).then(function(){
				colog.log(colog.colorGreen('Time entry saved'));
			
			}).catch(function(error) {
				colog.log(colog.colorRed(error));
			});
		}
		else{
			saveDetailHour(ptask);
		}
	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};


/* 
puser: information of the user
pprojects: information of the projects
phourType: id of the billable hour
creates and begins the task
*/
var	getTaskDate = function(puser, pprojects, phourType){
	var date = moment().tz("PST8PDT").format(DATE_FORMAT);
	
	var taskToInsert = {};

	taskToInsert = {
		created:  date,
		developer_id: puser.id,
		project_id: '',
		description: '',
		time: '',
		hour_type_id: phourType.id
	};
	//console.log(date);
	saveTask(taskToInsert, puser, pprojects);
};


var controllerAddEntry = {

	/*saves a task of an user in the TT*/
	saveWork: function(){
		var repos = [],
			billable = 0,
			userInfo = {},
			projects = [],
			configuration = config.getConfig();
	
		if(config.existConfig){
			user.login(configuration.email, configuration.password).then(function(puser){
				userInfo = puser.result;
				return project.getProjects(userInfo.id);

			}).then(function(pprojects) {
				projects = pprojects.result;
				return hourType.getHourType(userInfo.id);

			}).then(function(phourType) {
				billable = hourType.getBillable(phourType.result);
				utils.printArray(projects, NAME);
				getTaskDate(userInfo, projects, billable);

			}).catch(function(error) {
				colog.log(colog.colorRed(error));
			});
		}
		else{
			colog.log(colog.colorRed("Error: Configuration file doesn't exist"));
		}
	}
};

module.exports = controllerAddEntry;

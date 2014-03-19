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
	utils = require(path.resolve(__dirname,'../lib/utils.js')),
	hourType = require(path.resolve(__dirname,'../models/hour_type.js'));

var DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';


/* ptask: the task to save
save the task and the detail hour
*/
var saveDetailHour = function(ptask){
	
	utils.getPromptDetailHour().then(function(timeResult){
		var timeIn = moment(timeResult, 'HH:mm');
			timeOut = moment(timeResult, 'HH:mm');

			timeOut.add(parseFloat(ptask.time),'hours');

			ptask.time_in = timeIn.format('HH.mm');
			ptask.time_out = timeOut.format('HH.mm');

			return timeEntry.postTimeEntry(ptask);

	}).then(function(pdescription) {
		colog.log(colog.colorGreen('Time entry saved'));

	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};

/* ptask: the task to save
save the task
*/
var saveTask = function(ptask, puser, pprojects){
	var project = {},
		cancel = pprojects.length;

	cancel++;
	colog.log(colog.colorBlue(cancel + ': Cancel'));

	utils.getPromptProject().then(function(projectResult){
		if(projectResult < cancel){
			ptask.project_id = pprojects[projectResult - 1].id;
			return utils.getPromptDescription();
		}
		else{
			process.exit(0);
		}

	}).then(function(pdescription) {
		ptask.description = pdescription;
		return utils.getPromptTime();

	}).then(function(ptime) {
		ptask.time = utils.getWorkedHours(ptime);
		
		if(puser.devtype !== 'non_exempt'){
			timeEntry.postTimeEntry(ptask).then(function(){
				colog.log(colog.colorGreen('Time entry saved'));
			},
			function(err) {
				colog.log(colog.colorRed(err));
			});
		}
		else{
			saveDetailHour(ptask);
		}
	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};


/* phourType: id of the billable hour
prints the information of the commits 
if the last commit has a high date than the limitDate
*/
var	getTaskDate = function(puser, pprojects, phourType){

	var date = moment().format(DATE_FORMAT);
	
	var taskToInsert = {};

	taskToInsert = {
		created:  date,
		developer_id: puser.id,
		project_id: '',
		description: '',
		time: '',
		hour_type_id: phourType.id
	};
	saveTask(taskToInsert, puser, pprojects);
};


var controllerAddTask = {

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
				utils.printNames(projects);
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

module.exports = controllerAddTask;

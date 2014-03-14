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
	TIME_IN = /^[0-2]\d\:[0-6]\d$/,
	//ZONE = '-06:00',
	DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/* pmessage: message of the work
return a string with the number of hours worked
*/
var getWork = function(pmessage){
	var test = DIGITS.exec(pmessage);
	return test[0];
};

/* ptask: the task to save
save the task and the detail hour
*/
var saveDetailHour = function(ptask){
	prompt.get({
		properties: {
			timeIn: {
				description: "Begin of the task (HH:mm)".magenta,
				required: true,
				pattern: TIME_IN,
				message: 'Format: HH:mm. EX.: 09:05'.red
			}
		}
	}, function (err, resultPrompt) {
		var timeIn = moment(resultPrompt.timeIn, 'HH:mm');
			timeOut = moment(resultPrompt.timeIn, 'HH:mm');

		timeOut.add(parseFloat(ptask.time),'hours');

		timeIn = timeIn.format('HH.mm');
		timeOut = timeOut.format('HH.mm');

		ptask.time_in = timeIn; //parseFloat(resultPrompt.timeIn);
		ptask.time_out = timeOut; //ptask.time_in + parseFloat(ptask.time);

		//console.log(ptask);
		timeEntry.postTimeEntry(ptask).then(function(){
			colog.log(colog.colorGreen('Time entry saved'));
		},
		function(err) {
			colog.log(colog.colorRed(err));
		});
	});
};

/* ptask: the task to save
save the task
*/
var saveTask = function(ptask, puser, pprojects){

	prompt.start();
	prompt.get({
		properties: {
			project: {
				description: "Number of the project".magenta,
				required: true,
				pattern: PROJECT
			},
			description: {
				description: "Description of the taks".magenta,
				required: true
			},
			time: {
				description: "Worked hours".magenta,
				required: true,
				pattern: FORMATHOUR,
				message: 'Format: [float|int]h'.red
			}
		}
	}, function (err, resultPrompt) {
		ptask.project_id = pprojects[resultPrompt.project - 1].id;
		ptask.description = resultPrompt.description;
		ptask.time = getWork(resultPrompt.time);

		if(puser.devtype === 'non_exempt'){
			saveDetailHour(ptask);
		}
		else{
		//	console.log(ptask);
			timeEntry.postTimeEntry(ptask).then(function(){
				colog.log(colog.colorGreen('Time entry saved'));
			},
			function(err) {
				colog.log(colog.colorRed(err));
			});
		}
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

/* hours: array of type of hours
get the id of billable, 
*/
var getBillable = function(phours){
	var BILLABlE = 'Billable';
	var billableHour = _.find(phours, function(hour){ return hour.name === BILLABlE; });
	return billableHour;
//	getTaskDate(billableHour);
};


/*pprojects: projects of the user to display
prints the projects, get hour type*/
var printProjects = function(pprojects){
	colog.log(colog.colorMagenta('Select a project: '));
	_.each(pprojects, function(value, index){
		index ++;
		colog.log(colog.colorBlue(index + ': ' + value.name));
	});
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
				//console.log(puser.result);
				userInfo = puser.result;
				return project.getProjects(userInfo.id);

			}).then(function(pprojects) {
				//console.log(pprojects.result);
				//console.log(userInfo.id);
				projects = pprojects.result;
				return hourType.getHourType(userInfo.id);

			}).then(function(phourType) {
				//console.log(phourType);
				billable = getBillable(phourType.result);
				printProjects(projects);
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

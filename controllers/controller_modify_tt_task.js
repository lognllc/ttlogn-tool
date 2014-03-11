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
	FIELD = /^[0-6]$/,
	CREATED = /^\d\d$/,
	TIME_IN = /^[0-2]\d\:[0-6]\d$/,
	DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

var userId = 0,
	userType = '',
	projects = [],
	entryToModify = {};


/* pmessage: message of the work
return a string with the number of hours worked
*/
var getWork = function(pmessage){
	var test = DIGITS.exec(pmessage);
	return test[0];
};

/* save the task
*/
var saveTimeEntry = function(){

	task = {
		id: entryToModify.id,
		created:  entryToModify.created,
		developer_id: userId,
		project_id: entryToModify.project.id,
		description: entryToModify.tskDescription,
		time: entryToModify.time,
		hour_type_id: entryToModify.hour_type.id
	};

	if(userType === 'non_exempt'){
		task.time_in = entryToModify.detail_hours.time_in;
		task.time_out = entryToModify.detail_hours.time_out;
	}

	timeEntry.postTimeEntry(task).then(function(){
		colog.log(colog.colorGreen('Time entry saved'));
	});
};

/* modify the time in of the task
*/
var modifyTimeIn = function(){
	prompt.get({
		properties: {
			timeIn: {
				description: "Begin of the task (HH:mm)".magenta,
				required: true,
				pattern: TIME_IN,
				message: 'Format: HH.mm. EX.:09:05'.red
			}
		}
	}, function (err, resultPrompt) {
		var timeIn = moment.utc(resultPrompt.timeIn, 'HH:mm');
			timeOut = moment.utc(resultPrompt.timeIn, 'HH:mm');

		timeOut.add(parseFloat(entryToModify.time),'hours');

		timeIn = timeIn.format('HH.mm');
		timeOut = timeOut.format('HH.mm');

		entryToModify.detail_hours.time_in = timeIn;
		entryToModify.detail_hours.time_out = timeOut;
		printTimeEntry();
	});
};


/*modify the created date of the task
*/
var modifyCreated = function(){
	prompt.get({
		properties: {
			created: {
				description: "Created the: (DD)".magenta,
				required: true,
				pattern: CREATED,
				message: 'Format: DD'.red
			}
		}
	}, function (err, resultPrompt) {
		entryToModify.created = moment(entryToModify.created).date(resultPrompt.created).format(DATE_FORMAT);
		console.log(entryToModify);
		printTimeEntry();
	});
};



/* modify the time worked of the task
*/
var modifyTime = function(){
	var timeOut = moment(),
		timeIn = '',
		timeString = '',
		hourIn = 0;

	prompt.get({
		properties: {
			time: {
				description: "Worked hours".magenta,
				required: true,
				pattern: FORMATHOUR,
				message: 'Format: [float|int]h'.red
			}
		}
	}, function (err, resultPrompt) {

		entryToModify.time = getWork(resultPrompt.time);

		if(userType === 'non_exempt'){
			timeIn = entryToModify.detail_hours.time_in;
			hourIn =  parseFloat(timeIn).toFixed(2);
			timeString = hourIn.replace('.', ':');

			timeOut = moment(timeString, 'HH:mm');
			timeOut.add(parseFloat(entryToModify.time),'hours');
			timeOut = timeOut.format('HH.mm');
			entryToModify.detail_hours.time_out = timeOut;
		}
		printTimeEntry();
	});
};


/* modify the description of the task
*/
var modifyDescription = function(){
	
	prompt.get({
		properties: {
			description: {
				description: "Description".magenta,
				required: true
			}
		}
	}, function (err, resultPrompt) {
		entryToModify.tskDescription = resultPrompt.description;
		printTimeEntry();
	});
};

/* modify the project of the task
*/
var modifyProject = function(){
	
	colog.log(colog.colorMagenta('Select a project: '));
	_.each(projects, function(value, index){
		index++;
		colog.log(colog.colorBlue(index + ': ' + value.name));
	});

	prompt.get({
		properties: {
			project: {
				description: "Number of the project".magenta,
				required: true,
				pattern: PROJECT
			}
		}
	}, function (err, resultPrompt) {
		entryToModify.project = projects[resultPrompt.project - 1];
		printTimeEntry();
	});
};

/*phours: hours type of the user
modify the hour type of the task
*/
var modifyHourType = function(phours){
	
	colog.log(colog.colorMagenta('Select a project: '));
	_.each(phours.result, function(value, index){
		index ++;
		colog.log(colog.colorBlue(index + ': ' + value.name));
	});

	prompt.get({
		properties: {
			hours: {
				description: "Number of hour type".magenta,
				required: true,
				pattern: PROJECT
			}
		}
	}, function (err, resultPrompt) {
		entryToModify.hour_type = phours.result[resultPrompt.hours - 1];
		printTimeEntry();
	});
};


/*prints the time entry
*/
var printTimeEntry = function(){

	//console.log(entryToModify);
	var date = moment(entryToModify.created).format(DATE_FORMAT);

	colog.log(colog.colorMagenta('Select a field: '));
	colog.log(colog.colorBlue('1: Created: ' + date));
	colog.log(colog.colorBlue('2: Description: ' + entryToModify.tskDescription));
	colog.log(colog.colorBlue('3: Time: ' + entryToModify.time));
	colog.log(colog.colorBlue('4: Hour Type: ' + entryToModify.hour_type.name));
	colog.log(colog.colorBlue('5: Proyect: ' + entryToModify.project.name));
	if(userType === 'non_exempt'){
		colog.log(colog.colorBlue('6: Begin of task: ' + entryToModify.detail_hours.time_in));
	}
	colog.log(colog.colorBlue('7: Save '));
	colog.log(colog.colorBlue('8: Cancel '));

	prompt.get({
		properties: {
			field: {
				description: "Number of field".magenta,
				required: true,
				pattern: PROJECT
			}
		}
	}, function (err, resultPrompt) {
		switch(resultPrompt.field){
			case '1':
				modifyCreated();
				break;
			case '2':
				modifyDescription();
				break;
			case '3':
				modifyTime();
				break;
			case '4':
				hourType.getHourType(userId, modifyHourType);
				break;
			case '5':
				modifyProject();
				break;
			case '6':
				if(userType === 'non_exempt'){
					modifyTimeIn();
				}
				else{
					colog.log(colog.colorBlue('Error: not valid option'));
					printTimeEntry();
				}
				break;
			case '7':
				saveTimeEntry();
				break;
			case '8':
	//			return '';
			break;
			default:
				colog.log(colog.colorRed('Error: bad number'));
				printTimeEntry();
		}
	});
};

/*pentries: time entries to select
sets the time entry*/
var setTimeEntry = function(pentries){
	
	prompt.get({
		properties: {
			entry: {
				description: "Number of the entry".magenta,
				required: true,
				pattern: PROJECT
			}
		}
	}, function (err, resultPrompt) {
		entryToModify = pentries[resultPrompt.entry - 1];
		entryToModify.created = moment.utc(entryToModify.created).format(DATE_FORMAT);
		printTimeEntry();

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
		var timeEntries = _.filter(pentries.result.not_confirmed_dates, function(entries){ return entries.project.id === projects[resultPrompt.project - 1].id; }),
			date = moment();

		colog.log(colog.colorMagenta('Select a time entry: '));
		_.each(timeEntries, function(value, index){
			index++;
			date = moment.utc(value.created);
			date = date.format('l');
			colog.log(colog.colorBlue(index + ': ' + value.tskDescription + '. Date: ' + date));
		});
		setTimeEntry(timeEntries);
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
	colog.log(colog.colorMagenta('Select a project: '));
	_.each(pprojects.result, function(value, index){
		index++;
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

var controllerModifyTask = {

	/*modify a task of an user in the TT*/
	modifyWork: function(){
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

module.exports = controllerModifyTask;

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

var NUMBERS = /^\d+$/,
	TWOWEEKS = /^[0-1]\d\-[0-3]\d$/,
	MONTHLY = /^[0-3]\d$/,
	DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss',
	NAME = 'name',
	ENTRY_DESCRIPTION = 'tskDescription',
	RESTRICTION_PROJECT = 'Number of the project';

var userInfo = {},
	periodInfo = {},
	projects = [],
	entryToModify = {};

/* 
save the task
*/
var saveTimeEntry = function(){

	var date = entryToModify.created.format(DATE_FORMAT);
	
	task = {
		id: entryToModify.id,
		created:  date,
		developer_id: userInfo.id,
		project_id: entryToModify.project.id,
		description: entryToModify.tskDescription,
		time: entryToModify.time,
		hour_type_id: entryToModify.hour_type.id
	};

	if(userInfo.devtype === 'non_exempt'){
		task.time_in = entryToModify.detail_hours.time_in;
		task.time_out = entryToModify.detail_hours.time_out;
	}

	timeEntry.postTimeEntry(task).then(function(){
		colog.log(colog.colorGreen('Time entry saved'));
	});
};

/* 
modify the time in of the task
*/
var modifyTimeIn = function(){

	utils.getPromptDetailHour().then(function(timeResult){
		var timeIn = moment(timeResult, 'HH:mm');
			timeOut = moment(timeResult, 'HH:mm');

		timeOut.add(parseFloat(entryToModify.time),'hours');

		entryToModify.detail_hours.time_in = timeIn.format('HH.mm');
		entryToModify.detail_hours.time_out = timeOut.format('HH.mm');
		printTimeEntry();

	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};

/*
modify the created date of the task
*/
var validateCreated = function(pdate){
	var newDate = moment(), //.startOf('day'),
		today = moment(),
		month = 0;

	if(periodInfo.name === 'twoweeks'){
		month = pdate.split('-');
		pdate = _.last(month);
		month = parseInt(_.first(month),10) - 1;
		//console.log('month: ' + month);
		newDate.month(month);
		//console.log('New date: ' + newDate.format());
	}
	newDate.date(pdate);
	newDate = newDate.format();
	today = today.format();

	/*console.log('New date: ' + newDate);
	console.log('start: ' + periodInfo.period_start);
	console.log('end: ' + periodInfo.period_end);
	console.log('today: ' + today);*/

	if(periodInfo.period_start <= newDate &&
		newDate <= periodInfo.period_end && newDate <= today){
		entryToModify.created = moment(newDate);
	}
	else{
		colog.log(colog.colorRed('Invalid date'));
	}
};

/*
modify the created date of the task
*/
var modifyCreated = function(){
	var created = {
			required: true,
		},
		newDate = moment();
		today = moment();

	if(periodInfo.name === 'twoweeks'){
		created.pattern = TWOWEEKS;
		created.message = 'Format: MM-DD'.red;
		created.description = 'Created the: (MM-DD)'.magenta;
	}
	else{
		created.pattern = MONTHLY;
		created.message = 'Format: DD'.red;
		created.description = 'Created the: (DD)'.magenta;
	}

	prompt.get({
		properties: {
			created: created
		}
	}, function (err, resultPrompt) {
		validateCreated(resultPrompt.created);
		printTimeEntry();
	});
};


/* 
modify the time worked of the task
*/
var modifyTime = function(){
	var timeOut = moment(),
		timeIn = '',
		timeString = '',
		hourIn = 0;

	utils.getPromptTime().then(function(ptime){
		entryToModify.time = utils.getWorkedHours(ptime);

		if(userInfo.devtype === 'non_exempt'){
			timeIn = entryToModify.detail_hours.time_in;
			hourIn =  parseFloat(timeIn).toFixed(2);
			timeString = hourIn.replace('.', ':');

			timeOut = moment(timeString, 'HH:mm');
			timeOut.add(parseFloat(entryToModify.time),'hours');
			timeOut = timeOut.format('HH.mm');
			entryToModify.detail_hours.time_out = timeOut;
		}

		printTimeEntry();
	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};


/* 
modify the description of the task
*/
var modifyDescription = function(){
	var RESTRICTION_DESCRIPTION = 'Description';

	utils.getPromptText(RESTRICTION_DESCRIPTION).then(function(pdescription){
		entryToModify.tskDescription = pdescription;
		printTimeEntry();

	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};

/* 
modify the project of the task
*/
var modifyProject = function(){
	
	utils.printArray(projects, NAME);
	utils.getPromptNumber(RESTRICTION_PROJECT, projects).then(function(pproject){
		entryToModify.project = pproject;
		printTimeEntry();

	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};

/*
modify the hour type of an entry
*/
var getHourType = function(){
	var	RESTRICTION_HOUR = 'Number of the hour type';

	hourType.getHourType(userInfo.id).then(function(hourTypes){
		utils.printArray(hourTypes.result, NAME);
		return utils.getPromptNumber(RESTRICTION_PROJECT, hourTypes.result);

	}).then(function(phourType){
		entryToModify.hour_type = phourType;
		printTimeEntry();
	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};

/*prints the time entry, options
*/
var printOptions = function(){
//	console.log(entryToModify);
	var date = entryToModify.created.format(DATE_FORMAT);

	colog.log(colog.colorMagenta('Select a field: '));
	colog.log(colog.colorBlue('1: Created: ' + date));
	colog.log(colog.colorBlue('2: Description: ' + entryToModify.tskDescription));
	colog.log(colog.colorBlue('3: Time: ' + entryToModify.time));
	colog.log(colog.colorBlue('4: Hour Type: ' + entryToModify.hour_type.name));
	colog.log(colog.colorBlue('5: Proyect: ' + entryToModify.project.name));
	if(userInfo.devtype === 'non_exempt'){
		colog.log(colog.colorBlue('6: Begin of task: ' + entryToModify.detail_hours.time_in));
	}
	colog.log(colog.colorBlue('7: Save '));
	colog.log(colog.colorBlue('8: Cancel '));
};

/*prints the time entry and waits for an option
*/
var printTimeEntry = function(){
	printOptions();
	prompt.start();
	prompt.get({
		properties: {
			field: {
				description: "Number of field".magenta,
				required: true,
				default: '1',
				pattern: NUMBERS
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
				getHourType();
				break;
			case '5':
				modifyProject();
				break;
			case '6':
				if(userInfo.devtype === 'non_exempt'){
					modifyTimeIn();
				}
				else{
					colog.log(colog.colorRed('Error: not valid option'));
					printTimeEntry();
				}
				break;
			case '7':
				saveTimeEntry();
				break;
			case '8':
				colog.log(colog.colorRed('Canceled'));
				process.exit(0);
			break;
			default:
				colog.log(colog.colorRed('Error: bad number'));
				printTimeEntry();
		}
	});
};

var controllerModifyEntry = {

	/*modify a task of an user in the TT*/
	modifyWork: function(){
		var	RESTRICTION_ENTRY = 'Number of the entry';

		var repos = [],
			configuration = {},
			projectId = 0,
			periodEntries = [];
			timeEntries = [];
	
		if(config.existConfig){
			configuration = config.getConfig();

			user.login(configuration.email, configuration.password).then(function(puser){
				userInfo = puser.result;
				return user.getPeriod(userInfo.id);

			}).then(function(pperiod){
				//console.log(pperiod);
				periodInfo = pperiod.result;
				return project.getProjects(userInfo.id);

			}).then(function(pprojects){
				projects = pprojects.result;
				utils.printArray(projects, NAME);
				return utils.getPromptNumber(RESTRICTION_PROJECT, projects);

			}).then(function(projectResult){
				projectId = projectResult.id;
				return timeEntry.getUserPeriodTimeEntry(userInfo.id);

			}).then(function(entries) {
				periodEntries = entries.result.not_confirmed_dates.concat(entries.result.confirmed_dates);
				timeEntries = _.filter(periodEntries, function(pentries)
					{ return pentries.project.id === projectId; });

				utils.printArray(timeEntries, ENTRY_DESCRIPTION);
				return utils.getPromptNumber(RESTRICTION_ENTRY, timeEntries);

			}).then(function(pentry){
				entryToModify = pentry;
				//console.log(moment.utc(entryToModify.created).format());
				//console.log(moment(entryToModify.created).format());
				entryToModify.created = moment.utc(entryToModify.created);
				printTimeEntry();

			}).catch(function(error) {
				colog.log(colog.colorRed(error));
			});
		}
		else{
			colog.log(colog.colorRed("Error: Configuration file doesn't exist"));
		}
	}
};

module.exports = controllerModifyEntry;

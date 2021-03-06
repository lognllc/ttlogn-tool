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
	utils = require(path.resolve(__dirname,'../lib/utils.js')),
	hourType = require(path.resolve(__dirname,'../models/hour_type.js'));

var NUMBERS = /^\d+$/,
	TWO_WEEKS_PATTERN = /^[0-1]\d\-[0-3]\d$/,
	MONTHLY = /^[0-3]\d$/,
	DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss',
	ZONE_FORMAT = 'YYYY-MM-DD HH:mm:ss Z',
	NAME = 'name',
	ENTRY_DESCRIPTION = 'tskDescription',
	RESTRICTION_PROJECT = 'Number of the project',
	TWO_WEEKS = 'twoweeks';

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

	timeEntry.postTimeEntry(task, userInfo.token).then(function(){
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
	var newDate = moment().tz("PST8PDT").startOf('day'), //.startOf('day'),
		today = moment().tz("PST8PDT").format(),
		month = 0;

	if(periodInfo.name === TWO_WEEKS){
		month = pdate.split('-');
		pdate = _.last(month);
		month = parseInt(_.first(month),10) - 1;
		newDate.month(month);
	}
	newDate.date(pdate);
	newDate = newDate.format();

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
		};

	if(periodInfo.name === TWO_WEEKS){
		created.pattern = TWO_WEEKS_PATTERN;
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

	hourType.getHourType(userInfo.id, userInfo.token).then(function(hourTypes){
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
	var date = entryToModify.created.format(DATE_FORMAT);

	colog.log(colog.colorMagenta('Select a field: '));
	colog.log(colog.colorMagenta('1: Created: ' + date));
	colog.log(colog.colorMagenta('2: Description: ' + entryToModify.tskDescription));
	colog.log(colog.colorMagenta('3: Time: ' + entryToModify.time));
	colog.log(colog.colorMagenta('4: Hour Type: ' + entryToModify.hour_type.name));
	colog.log(colog.colorMagenta('5: Proyect: ' + entryToModify.project.name));
	if(userInfo.devtype === 'non_exempt'){
		colog.log(colog.colorMagenta('6: Begin of task: ' + entryToModify.detail_hours.time_in));
	}
	colog.log(colog.colorMagenta('7: Save '));
	colog.log(colog.colorMagenta('8: Cancel '));
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

		var configuration = {},
			projectId = 0;
	
		if(config.existConfig){
			configuration = config.getConfig();

			user.login(configuration.email, configuration.password).then(function(puser){
				userInfo = puser.result.user;
				userInfo.token = {
					token: puser.result.token,
					email: configuration.email
				};
				return user.getPeriod(userInfo.id, userInfo.token);

			}).then(function(pperiod){
				periodInfo = pperiod.result;
				return project.getProjects(userInfo.id, userInfo.token);

			}).then(function(pprojects){
				projects = pprojects.result;
				utils.printArray(projects, NAME);
				return utils.getPromptNumber( RESTRICTION_PROJECT, projects );

			}).then(function(projectResult){
				projectId = projectResult.id;
				return timeEntry.getUserPeriodTimeEntry( userInfo.id, projectId, userInfo.token );

			}).then(function(entries) {
				utils.printArray( entries.result.not_confirmed_dates, ENTRY_DESCRIPTION );
				return utils.getPromptNumber( RESTRICTION_ENTRY, entries.result.not_confirmed_dates );

			}).then(function(pentry){
				entryToModify = pentry;
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

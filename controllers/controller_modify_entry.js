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
	CREATED = /^\d\d$/,
	DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

var userInfo = {},
	projects = [],
	entryToModify = {};

/* 
save the task
*/
var saveTimeEntry = function(){

	task = {
		id: entryToModify.id,
		created:  entryToModify.created,
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
	
	utils.getPromptDescription().then(function(pdescription){
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
	
	utils.printNames(projects);
	utils.getPromptProject(projects).then(function(pproject){
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
	hourType.getHourType(userInfo.id).then(function(hourTypes){
		utils.printNames(hourTypes.result);
		return utils.getPromptHourType(hourTypes.result);

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
	console.log(entryToModify);
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
					colog.log(colog.colorBlue('Error: not valid option'));
					printTimeEntry();
				}
				break;
			case '7':
				saveTimeEntry();
				break;
			case '8':
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
		var repos = [],
			configuration = {},
			projectId = 0,
			timeEntries = {};
	
		if(config.existConfig){
			configuration = config.getConfig();

			user.login(configuration.email, configuration.password).then(function(puser){
				userInfo = puser.result;
				return project.getProjects(userInfo.id);

			}).then(function(pprojects){
				projects = pprojects.result;
				utils.printNames(projects);
				return utils.getPromptProject(projects);

			}).then(function(projectResult){
				projectId = projectResult.id;
				return timeEntry.getUserPeriodTimeEntry(userInfo.id);

			}).then(function(entries) {
				timeEntries = _.filter(entries.result.not_confirmed_dates, function(pentries)
					{ return pentries.project.id === projectId; });

				utils.printEntries(timeEntries);
				return utils.getPromptTimeEntry(timeEntries);

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

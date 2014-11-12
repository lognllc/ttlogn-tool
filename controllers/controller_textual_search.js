var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	moment = require('moment-timezone'),
	prompt = require('prompt'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	utils = require(path.resolve(__dirname,'../lib/utils.js'));

var	ENTRY_DESCRIPTION = 'tskDescription';

/*
puser: user
pentry: time entry
prints the time entry
*/
var printOptions = function(puser, pentry){
	var DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

	var date = pentry.created.format(DATE_FORMAT);

	colog.log(colog.colorMagenta('Created: ' + date));
	colog.log(colog.colorMagenta('Description: ' + pentry[ENTRY_DESCRIPTION]));
	colog.log(colog.colorMagenta('Time: ' + pentry.time));
	colog.log(colog.colorMagenta('Hour Type: ' + pentry.hour_type.name));
	colog.log(colog.colorMagenta('Proyect: ' + pentry.project.name));
	if(puser.devtype === 'non_exempt'){
		colog.log(colog.colorMagenta('Begin of task: ' + pentry.detail_hours.time_in));
	}
};

/* ptext: console parameters to search
   makes one text with all the parameters 
*/

var getText = function(ptext){
	var newArray = _.rest(ptext),
		text = '';

	if(newArray.length > 0){
		text = _.first(newArray);
		newArray =  _.rest(newArray);
	}
	_.each(newArray, function(value){
		text += (' ' + value);
	});
	return text;
};

var controllerTextualSearch = {

	/* ptext: text to search
	searches in the TT for the entries with a text*/
	textualSearch: function(ptext){
		var	RESTRICTION_ENTRY = 'Number of the entry';

		var configuration = {},
			userInfo = {},
			text = getText(ptext);
	
		if(config.existConfig){
			configuration = config.getConfig();

			user.login(configuration.email, configuration.password).then(function(puser){
				userInfo = puser.result;
				return user.getTextualSearch(userInfo.id, text);

			}).then(function(entries) {
				utils.printArray(entries.result, ENTRY_DESCRIPTION);
				return utils.getPromptNumber(RESTRICTION_ENTRY, entries.result);

			}).then(function(pentry){
				pentry.created = moment.utc(pentry.created);
				printOptions(userInfo, pentry);

			}).catch(function(error) {
				colog.log(colog.colorRed(error));
			});
		}
		else{
			colog.log(colog.colorRed("Error: Configuration file doesn't exist"));
		}
	}
};

module.exports = controllerTextualSearch;

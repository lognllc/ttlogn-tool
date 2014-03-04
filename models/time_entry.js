var //_ = require('underscore'),
	path = require('path'),
	dataAccess = require(path.resolve(__dirname,'../dataAccess/apitt_data_access.js'));

var TIME_ENTRY = '/time_entries/createUpdate.json';

var time_entry = {
	
	/* pentry: object with the information need to post the time entry
	pfunction: funtion to send the projects
	get the projects of an user
	*/
	postTimeEntry: function(pentry){
		return dataAccess.waitPost(TIME_ENTRY, pentry);
	}
};

module.exports = time_entry;
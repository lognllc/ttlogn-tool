var //_ = require('underscore'),
	path = require('path'),
	dataAccess = require(path.resolve(__dirname,'../dataAccess/apitt_data_access.js'));

var TIME_ENTRY = '/time_entries/createUpdate.json';

var time_entry = {
	
	/* pentry: object with the information need to post the time entry
	post the time entry of an user's project 
	*/
	postTimeEntry: function(pentry){
		//console.log(pentry);
		return dataAccess.waitPost(TIME_ENTRY, pentry);
	}
};

module.exports = time_entry;
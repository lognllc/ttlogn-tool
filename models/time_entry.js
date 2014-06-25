var //_ = require('underscore'),
	path = require('path'),
	dataAccess = require(path.resolve(__dirname,'../dataAccess/apitt_data_access.js'));

var TIME_ENTRY = '/time_entries/createUpdate.json',
	USER_TIME_ENTRIES = '/users/get_this_period_entries.json?id=',
	DELETE_TIME_ENTRIES = '/users/delete_time_entry.json',
	PROJECT = '&project_id=';

var time_entry = {
	
	/* pentry: object with the information need to post the time entry
	ptoken: token for the api validation
	post the time entry of an user's project 
	*/
	postTimeEntry: function(pentry, ptoken){
		return dataAccess.post(TIME_ENTRY, pentry, ptoken);
	},
	/* pentry: object with the information need to delete the time entry
	ptoken: token for the api validation
	delete a time entry of an user
	*/
	deleteTimeEntry: function(pentry, ptoken){
		return dataAccess.post(DELETE_TIME_ENTRIES, pentry, ptoken);
	},
	/* puserId: user's id
	pprojectId: project's id
	ptoken: token for the api validation
	get the time entries of this period
	*/
	getUserPeriodTimeEntry: function(puserId, pprojectId, ptoken){
		var message = USER_TIME_ENTRIES + puserId + PROJECT + pprojectId;
		return dataAccess.get(message, ptoken);
	}
};

module.exports = time_entry;
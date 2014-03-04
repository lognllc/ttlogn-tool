var //_ = require('underscore'),
	path = require('path'),
	dataAccess = require(path.resolve(__dirname,'../dataAccess/apitt_data_access.js'));

var HOUR_TYPE = '/hour_types.json';

var hourType = {

	/* 
	pfunction: funtion to send the projects
	get the hour types
	*/
	getHourType: function(pfunction){
		var message	=  HOUR_TYPE;
		dataAccess.get(message, pfunction);
	}

};

module.exports = hourType;
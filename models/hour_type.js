var //_ = require('underscore'),
	path = require('path'),
	dataAccess = require(path.resolve(__dirname,'../dataAccess/apitt_data_access.js'));

var HOUR_TYPE = '/users/hour_types.json?id=';

var hourType = {

	/* 
	pfunction: funtion to send the projects,
	puserId: users id
	get the hour types of an user
	*/
	getHourType: function(puserId){
		var message	=  HOUR_TYPE + puserId;
		return dataAccess.get(message);
	}

};

module.exports = hourType;
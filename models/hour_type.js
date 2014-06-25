var _ = require('underscore'),
	path = require('path'),
	dataAccess = require(path.resolve(__dirname,'../dataAccess/apitt_data_access.js'));

var HOUR_TYPE = '/users/hour_types.json?id=';

var hourType = {

	/* 
	puserId: user's id
	ptoken: token for the api validation
	get the hour types of an user
	*/
	getHourType: function(puserId, ptoken){
		var message	=  HOUR_TYPE + puserId;
		return dataAccess.get(message, ptoken);
	},

	/* phours: array of type of hours
	get billable type, 
	*/
	getBillable: function(phours){
		var BILLABlE = 'Billable';
		var billableHour = _.find(phours, function(hour){ return hour.name === BILLABlE; });
		return billableHour;
	}

};

module.exports = hourType;
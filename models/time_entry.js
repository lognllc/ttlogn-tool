var //_ = require('underscore'),
	path = require('path'),
	fs = require('fs');

var POST_TIME_ENTRY = '/time_entries/createUpdate?created=',
	DEVELOPER = '&developer_id=',
	PROJECT = '&project_id=',
	DESCRIPTION = '&description=',
	TIME = '&time=',
	HOUR_TYPE = '&hour_type_id';


var time_entry = {
	
	postTimeEntry: function(puser){
		var message	= POST_TIME_ENTRY + '' + DEVELOPER + '' + PROJECT + '' + DESCRIPTION + '' + TIME + '' + HOUR_TYPE + '';
		dataAccess.post(message,'function');
	}

};

module.exports = time_entry;

/*
/time_entries/createUpdate?created=2011-06-21T13:42:22.000Z
&developer_id=169
&project_id=3
&description=pruebaTT2dos
&time=2.0
&hour_type_id=1
*/
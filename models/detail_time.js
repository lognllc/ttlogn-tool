var //_ = require('underscore'),
	path = require('path'),
	fs = require('fs');

var configPath;

var detailTime = {

	setDetailTime: function(pentry, phour, pdate){
		var timeIn = pdate,
			timeOut = timeIn;

		timeIn = timeIn.format('HH.mm');
		pentry.time_in = timeIn;

		timeOut.add((phour),'hours');
		timeOut = timeOut.format('HH.mm');
		pentry.time_out = timeOut;
	}

};

module.exports = detailTime;
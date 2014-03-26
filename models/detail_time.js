var //_ = require('underscore'),
	path = require('path'),
	moment = require('moment'),
	fs = require('fs');

var configPath;

var detailTime = {

	/* 
	pentry: entry to insert the detail times,
	phour: hours worked
	pdate: time of timeIn
	sets the detail time of a new entry
	*/
	setDetailTime: function(pentry, phour, pdate){
		var timeIn = moment(pdate, 'HH:mm');
			timeOut = moment(pdate, 'HH:mm');

		timeOut.add(parseFloat(pentry.time),'hours');

		pentry.time_in = timeIn.format('HH.mm');
		pentry.time_out = timeOut.format('HH.mm');
	},

	/* 
	pentry: entry to insert the detail times,
	phour: hours worked
	pdate: time of timeIn
	sets the detail time of a new entry
	*/
	setDetailTimeOut: function(pentry, phour, pdate){
		var timeIn = moment(pdate, 'HH:mm');
			timeOut = moment(pdate, 'HH:mm');

		timeIn.subtract(parseFloat(pentry.time),'hours');

		pentry.time_in = timeIn.format('HH.mm');
		pentry.time_out = timeOut.format('HH.mm');
	}

};

module.exports = detailTime;
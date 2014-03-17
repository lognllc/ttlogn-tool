var _ = require('underscore'),
	path = require('path'),
	colog = require('colog');

var utils = {

	printNames: function(parray){
		
		_.each(parray, function(value, index){
			index++;
			colog.log(colog.colorBlue(index + ': ' + value.name));
		});
	}
};

module.exports = utils;
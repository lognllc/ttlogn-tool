var path = require('path'),
	pivotal = require("pivotal"),
	RSVP = require('rsvp'),
	colog = require('colog'),
	fs = require('fs');

var configPath;

var story = {

	// returns the limit date
	getStory: function(idproject){
		var promise = new RSVP.Promise(function(resolve, reject){
			var self = this,
				stories = [],
				filter = {};
console.log(idproject);
			pivotal.getStories(idproject, filter, function(err, ret){
				if(!err){
					console.log('entre');
					resolve(ret);
				}
				else{
					colog.log(colog.colorRed('Error: Something went wrong on the request: ' + err.desc));
					reject(self);
				}
			});

		});
		return promise;
	}
};

module.exports = story;
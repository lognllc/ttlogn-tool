var path = require('path'),
	RSVP = require('rsvp'),
	_ = require('underscore'),
	pivotal = require('pivotal'),
	fs = require('fs');

var configPath;

var task = {
	
	/* pprojectId: id of the project
	puser: token of the user
	pstoryId: id of the story
	get the tasks of a story of an user 
	*/
	getTasks: function(pprojectId, puser, pstoryId){
		var promise = new RSVP.Promise(function(resolve, reject){
			var self = this,
				tasks = [];

			pivotal.useToken(puser);

			pivotal.getTasks(pprojectId, pstoryId, function(err, ret){
				if(!err){
					if(_.isArray(ret.task)){
						tasks = ret.task;
					}
					else{
						if(typeof ret.task !== 'undefined'){
							tasks.push(ret.task);
						}
					}
					resolve(tasks);
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

module.exports = task;
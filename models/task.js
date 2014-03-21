var path = require('path'),
	fs = require('fs');

var configPath;

var task = {
		// returns the limit date
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
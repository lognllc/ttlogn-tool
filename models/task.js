var path = require('path'),
	RSVP = require('rsvp'),
	_ = require('underscore'),
	pivotal = require('pivotal'),
	fs = require('fs'),
	dataAccess = require(path.resolve(__dirname,'../dataAccess/pivotal_data_access.js'));

var UNFINISH = false,
	PROJECT = 'projects/',
	STORIES = '/stories/' ,
	TASKS = '/tasks';

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
	},

	/* pprojects: project of the user
	puser: token of the user
	pstory: new story
	add a new story to the TT 
	*/
	addTask: function(pproject, puser, pstory, ptask){
		
		ptask.task.complete = UNFINISH;
		url = PROJECT + pproject.id + STORIES + pstory.id + TASKS;
		return dataAccess.post(puser, url, ptask);
	},

	/* pprojects: project of the user
	puser: token of the user
	pstory: new story
	add a new story to the TT 
	*/

	
	/*finishTask: function(pproject, puser, pstory, ptask){
		
		ptask.task.complete = UNFINISH;
		url = PROJECT + pproject.id + STORIES + pstory.id + TASKS;
		return dataAccess.post(puser, url, ptask);
	}*/

};

module.exports = task;
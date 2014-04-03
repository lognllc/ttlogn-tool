var path = require('path'),
	_ = require('underscore'),
	pivotal = require('pivotal'),
	RSVP = require('rsvp'),
	colog = require('colog'),
	fs = require('fs'),
	dataAccess = require(path.resolve(__dirname,'../dataAccess/pivotal_data_access.js'));

var PROJECT = 'projects/',
	STORIES = '/stories/';

var story = {

	/* pproject: project of the user
	puserName: name of the user
	pfilter: filter of the stories
	get the stories of a project of an user 
	*/
	getStory: function(pproject, puserName, pfilter){
		var promise = new RSVP.Promise(function(resolve, reject){
			var self = this,
				filteredProject = [];
				filter = {};

			pivotal.getStories(pproject.id, filter, function(err, ret){
				if(!err){
					
					if(_.isArray(ret.story)){
						pproject.stories = ret.story;
					}
					else{
						pproject.stories = [];
						if(typeof ret.story !== 'undefined'){
							pproject.stories.push(ret.story);
						}
					}
					if(pfilter !== '-a'){
						filteredProject = _.filter(pproject.stories, function(pstory)
							{ return  ((pstory.current_state === 'unstarted' || pstory.current_state === 'started')) &&
							pstory.owned_by === puserName;});
						pproject.stories = filteredProject;
					}
					else{
						filteredProject = _.filter(pproject.stories, function(pstory)
							{ return pstory.owned_by === puserName;});
						pproject.stories = filteredProject;
					}
					resolve();
				}
				else{
					colog.log(colog.colorRed('Error: Something went wrong on the request: '));
					colog.log(colog.colorRed(err.desc));
					reject(self);
				}
			});

		});
		return promise;
	},

	/* pprojects: project of the user
	puser: token of the user
	puserName: name of the user
	pfilter: filter of the stories
	get the stories of the projects of an user 
	*/
	getStories: function(pprojects, puser, puserName, pfilter){
		var promise = new RSVP.Promise(function(resolve, reject){
			var self = this,
				promises = [];

			pivotal.useToken(puser);
	
			_.each(pprojects, function(value){
				promises.push(story.getStory(value, puserName, pfilter));
			});
			RSVP.all(promises).then(function() {
				resolve();
			}).catch(function(reason){
				reject(self);
				colog.log(colog.colorRed(reason));
			});
		});
		return promise;
	},

	/* pprojects: project of the user
	puser: token of the user
	pstory: new story
	add a new story to the TT 
	*/
	addStory: function(pproject, puser, pstory){
		//var promise = new RSVP.Promise(function(resolve, reject){
		//	var self = this;

		/*	pivotal.useToken(puser);

			console.log(pproject.id);
			console.log(pstory);
			//console.log(puser);

			console.log(pivotal.updateStory.toString());
			console.log('antes');*/


			url = 'projects/' + pproject.id + '/stories';
			return dataAccess.post(puser, url, pstory);

			//pivotal.updateStory(pproject.id, '67880094', pstory, function(err, ret){
			/*pivotal.addStory(pproject.id, pstory, function(err, ret){
			//pivotal.getStories(pproject.id, pstory, function(err, ret){
				console.log('entre1');
				console.log(err);
				console.log(ret);
				
				if(!err){
					console.log('entre');
					resolve();
				}
				else{
					colog.log(colog.colorRed('Error: Something went wrong on the request: '));
					colog.log(colog.colorRed(err.desc));
					reject(self);
				}
			});*/
	
		//});
		//return promise;
	},

		/* pprojects: project of the user
	puser: token of the user
	pstory: new story
	add a new story to the TT 
	*/
	modifyStory: function(pproject, puser, pstory, pstoryId){
			url = PROJECT + pproject.id + STORIES + pstoryId;
			return dataAccess.post(puser, url, pstory);
	},

	/* pprojectId: id of the project
	puser: token of the user
	pstoryId: id of the story
	delete a story of a project of an user
	*/
	deleteStory: function(pprojectId, pstoryId, puser){
		var promise = new RSVP.Promise(function(resolve, reject){
			var self = this;
			
			pivotal.useToken(puser);
			pivotal.removeStory(pprojectId, pstoryId, function(err, ret){
				if(!err){
					resolve();
				}
				else{
					colog.log(colog.colorRed('Error: Something went wrong on the request: '));
					colog.log(colog.colorRed(err.desc));
					reject(self);
				}
			});
		});
		return promise;
	},

	/* pprojectId: id of the project
	puser: token of the user
	pstoryId: id of the story
	deliver all the finished stories of a project of an user
	*/
	// volver a hacer xq hace deliver a todos los finish hasta donde es requester
	deliverStories: function(puser, pprojectId){
		var promise = new RSVP.Promise(function(resolve, reject){
			var self = this;
			
			pivotal.useToken(puser);
			pivotal.deliverAllFinishedStories(pprojectId, function(err, ret){
				if(!err){
					resolve();
				}
				else{
					colog.log(colog.colorRed('Error: Something went wrong on the request: '));
					colog.log(colog.colorRed(err.desc));
					reject(self);
				}
			});
		});
		return promise;
	}

};

module.exports = story;
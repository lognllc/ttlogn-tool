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
					switch(pfilter)
					{
						case '-a':
						filteredProject = _.filter(pproject.stories, function(pstory)
							{ return pstory.owned_by === puserName;});
							break;
						case '-f':
						filteredProject = _.filter(pproject.stories, function(pstory)
							{ return  (pstory.current_state === 'finished' &&
							pstory.owned_by === puserName);});
							break;
						default:
						filteredProject = _.filter(pproject.stories, function(pstory)
							{ return  ((pstory.current_state === 'unstarted' || pstory.current_state === 'started') &&
							pstory.owned_by === puserName);});
					}
					pproject.stories = filteredProject;



					/*if(pfilter !== '-a'){
						filteredProject = _.filter(pproject.stories, function(pstory)
							{ return  ((pstory.current_state === 'unstarted' || pstory.current_state === 'started')) &&
							pstory.owned_by === puserName;});
						pproject.stories = filteredProject;
					}
					else{
						filteredProject = _.filter(pproject.stories, function(pstory)
							{ return pstory.owned_by === puserName;});
						pproject.stories = filteredProject;
					}*/
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
	addStory: function(pprojectId, puser, pstory){
		var url = 'projects/' + pprojectId + '/stories';
		return dataAccess.post(puser, url, pstory);
	},

		/* pprojects: project of the user
	puser: token of the user
	pstory: new story
	add a new story to the TT 
	*/
	modifyStory: function(pprojectId, puser, pstory, pstoryId){
		var url = PROJECT + pprojectId + STORIES + pstoryId;
		return dataAccess.put(puser, url, pstory);
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
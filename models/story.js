var path = require('path'),
	_ = require('underscore'),
	pivotal = require("pivotal"),
	RSVP = require('rsvp'),
	colog = require('colog'),
	fs = require('fs');

var configPath;

var story = {

	// returns the limit date
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
					resolve(self);
				}
				else{
					colog.log(colog.colorRed('Error: Something went wrong on the request: ' + err.desc));
					reject(self);
				}
			});

		});
		return promise;
	},

	// returns the limit date
	getStories: function(pprojects, puser, puserName, pfilter){
		var promise = new RSVP.Promise(function(resolve, reject){
			var self = this,
				promises = [];

			pivotal.useToken(puser);
	
			if(_.isArray(pprojects.project)){
				_.each(pprojects.project, function(value){
					promises.push(story.getStory(value, puserName, pfilter));
				});
				RSVP.all(promises).then(function() {
					resolve(self);
				}).catch(function(reason){
					reject(self);
					colog.log(colog.colorRed(reason));
				});
			}
			else{
				story.getStory(pprojects.project, puserName, pfilter).then(function(){
					resolve(self);
				}).catch(function(error) {
					reject(self);
					colog.log(colog.colorRed(error));
				});
			}
		});
		return promise;
	}

};

module.exports = story;
var path = require('path'),
	_ = require('underscore'),
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
	getProjectStories: function(pproject, ptoken, puserId, pfilter){
		var promise = new RSVP.Promise(function(resolve, reject){
			var self = this,
				filteredProject = [];
				url = PROJECT + pproject.project_id + STORIES;

			dataAccess.get(ptoken, url).then(function(pstories){
			//console.log(pstories);	
				if(_.isArray(pstories)){
					pproject.stories = pstories;
				}
				else{
					pproject.stories = [];
					if(typeof pstories !== 'undefined'){
						pproject.stories.push(pstories);
					}
				}
				switch(pfilter)
				{
					case '-a':
					filteredProject = _.filter(pproject.stories, function(pstory)
						{ return pstory.owned_by_id === puserId;});
						break;
					case '-f':
					filteredProject = _.filter(pproject.stories, function(pstory)
						{ return  (pstory.current_state === 'finished' &&
						pstory.owned_by_id === puserId);});
						break;
					default:
					filteredProject = _.filter(pproject.stories, function(pstory)
						{ return  ((pstory.current_state === 'unstarted' || pstory.current_state === 'started') &&
						pstory.owned_by_id === puserId);});
				}
				pproject.stories = filteredProject;
				//console.log(pproject.stories);
				resolve();
			}).catch(function(error) {
				colog.log(colog.colorRed(error));
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
	getStories: function(pprojects, ptoken, puserId, pfilter){
		var promise = new RSVP.Promise(function(resolve, reject){
			var self = this,
				promises = [];
	
			_.each(pprojects, function(value){
				promises.push(story.getProjectStories(value, ptoken, puserId, pfilter));
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
		var url = PROJECT + pprojectId + STORIES;
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
		var url = PROJECT + pprojectId + STORIES + pstoryId;
		return dataAccess.delete(puser, url);
	}

};

module.exports = story;
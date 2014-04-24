var path = require('path'),
	_ = require('underscore'),
	RSVP = require('rsvp'),
	colog = require('colog'),
	fs = require('fs'),
	dataAccess = require(path.resolve(__dirname,'../dataAccess/pivotal_data_access.js'));

var PROJECT = 'projects/',
	STORIES = '/stories/',
	FILTER_STARTED = '-s',
	FILTER_UNSTARTED = '-u',
	FILTER_FINISHED = '-f',
	FILTER_REQUESTED = '-r';

	/*  pfilter: input filter of the user
	sets the filter to request the project stories
	*/
	var getFilter = function(pfilter){
		var FILTER = '?with_state=',
			STARTED = 'started',
			UNSTARTED = 'unstarted',
			FINISHED = 'finished';

		var newFilter = '';

		switch(pfilter)
		{
			case FILTER_STARTED:
				newFilter = FILTER + STARTED;
				break;
			case FILTER_UNSTARTED:
				newFilter = FILTER + UNSTARTED;
				break;
			case FILTER_FINISHED:
				newFilter = FILTER + FINISHED;
				break;
			default:
		}
		return newFilter;
	};


	/* pproject: project of the user
	ptoken: token of the user
	puserId: id of the user of the user
	pfilter: filter of the stories
	get the stories of a project of an user 
	*/
	var getProjectStories = function(pproject, ptoken, puserId, pfilter, puserFilter){
		var promise = new RSVP.Promise(function(resolve, reject){
			var filteredProject = [],
				url = PROJECT + pproject.project_id + STORIES + pfilter;

			dataAccess.get(ptoken, url).then(function(pstories){
				if(_.isArray(pstories)){
					pproject.stories = pproject.stories.concat(pstories);
				}
				else{
					if(typeof pstories !== 'undefined'){
						pproject.stories.push(pstories);
					}
				}
				switch(puserFilter)
				{
					case FILTER_REQUESTED:
					filteredProject = _.filter(pproject.stories, function(pstory)
						{ return pstory.requested_by_id === puserId;});
						break;
					default:
					filteredProject = _.filter(pproject.stories, function(pstory)
						{ return _.contains(pstory.owner_ids, puserId);});
				}
				pproject.stories = filteredProject;
				resolve();
			}).catch(function(error) {
				colog.log(colog.colorRed(error));
				reject(error);
			});

		});
		return promise;
	};

	/* 
	pfilter: filter of the stories
	sets the filters for the request, undefined filter is an unstarted or started story
	*/
	var filterOfStories = function(pfilter){
		var	newFilters = [];

		if(typeof pfilter === 'undefined'){
			newFilters.push(getFilter(FILTER_UNSTARTED));
			newFilters.push(getFilter(FILTER_STARTED));
		}
		else{
			newFilters.push(getFilter(pfilter));
		}
		return newFilters;
	};

	/* pproject: project of the user
	ptoken: token of the user
	puserId: id of the user of the user
	pfilter: filter of the stories
	puserFilters: pfilters of the user
	get the stories of the projects of an user 
	*/
	var getFilteredStories = function(pproject, ptoken, puserId, pfilter, puserFilters){
		var promise = new RSVP.Promise(function(resolve, reject){
			var promises = [];
			pproject.stories = [];

			_.each(pfilter, function(value){
				promises.push(getProjectStories(pproject, ptoken, puserId, value, puserFilters));
			});
			RSVP.all(promises).then(function() {
				resolve();
			}).catch(function(reason){
				reject(reason);
				colog.log(colog.colorRed(reason));
			});
		});
		return promise;
	};

var story = {

	/* pproject: project of the user
	ptoken: token of the user
	puserId: id of the user of the user
	pfilter: filter of the stories
	get the stories filtered
	*/
	getStoriesFiltered: function(pproject, ptoken, puserId, pfilter){
		var newFilters = filterOfStories(pfilter);
		return getFilteredStories(pproject, ptoken, puserId, newFilters, pfilter);
	},

	/* pprojects: projects of the user
	ptoken: token of the user
	puserId: id of the user of the user
	pfilter: filter of the stories
	get the stories of the projects of an user 
	*/
	getStories: function(pprojects, ptoken, puserId, pfilter){
		var promise = new RSVP.Promise(function(resolve, reject){
			var promises = [],
				newFilters = filterOfStories(pfilter);
		
			_.each(pprojects, function(value){
				promises.push(getFilteredStories(value, ptoken, puserId, newFilters, pfilter));
			});
			RSVP.all(promises).then(function() {
				resolve();
			}).catch(function(reason){
				reject(reason);
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
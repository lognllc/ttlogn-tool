var path = require('path'),
	fs = require('fs'),
	_ = require('underscore'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	story = require(path.resolve(__dirname,'../models/story.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	utils = require(path.resolve(__dirname,'../lib/utils.js')),
	config = require(path.resolve(__dirname,'../models/config.js')),
	project = require(path.resolve(__dirname,'../models/project.js'));

/* prepo: array of commits
sort the repo "tree"
*/
var	deliver = function(puserId, pprojects){
	var FINISHED = 'delivered';

	var promises = [],
		newStory = {
			current_state: FINISHED
		};

	_.each(pprojects, function(item){
		_.each(item.stories, function(value){
			colog.log(colog.colorBlue('Delivering: ' + value.name));
			promises.push(story.modifyStory(item.id, puserId, newStory, value.id));
			//promises.push(story.deliverStories(puserId, item.id));
		});
	});
	RSVP.all(promises).then(function() {
		colog.log(colog.colorGreen('Stories delivered successfully'));
	}).catch(function(reason){
		colog.log(colog.colorRed(reason));
	});
};


var controllerAddStory = {
	
	/*
	pfilter: filter to delete the story
	delete a story
	*/
	deliverStories: function(){
		var FILTER = '-f';

		var userId = '',
			storyProjects = [],
			pivotalUser = '',
			configuration = config.getConfig(),
			newStory = {};
	
		if(config.existConfig){
			colog.log(colog.colorGreen('Loading...'));

			user.pivotalLogin(configuration).then(function(puserId){
				userId = puserId;
				//console.log(userId);
				return project.getPivotalProjects(userId);

			}).then(function(pprojects){
				storyProjects = pprojects;
				//console.log(pprojects);
				return project.getMemberships(userId, storyProjects);

			}).then(function(pmemberships){
				//console.log(pmemberships);
				pivotalUser = user.getPivotalUser(configuration.pivotalEmail, pmemberships);
				return story.getStories(storyProjects, userId, pivotalUser, FILTER);

			}).then(function(){
			//	console.log(storyProjects);
				deliver(userId, storyProjects);

			/*}).then(function(){
				colog.log(colog.colorGreen('New story saved.'));
*/
			}).catch(function(error) {
				colog.log(colog.colorRed(error));
			});
		}
		else{
			colog.log(colog.colorRed("Error: Configuration file doesn't exist"));
		}
	}
};

module.exports = controllerAddStory;
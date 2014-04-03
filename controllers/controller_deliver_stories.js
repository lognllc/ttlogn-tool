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
	promises = [];
	_.each(pprojects, function(item){
		promises.push(story.deliverStories(puserId, item.id));
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
		var userId = '',
			storyProject = [],
			pivotalUser = '',
			configuration = config.getConfig(),
			newStory = {};
	
		if(config.existConfig){
			colog.log(colog.colorGreen('Loading...'));

			user.pivotalLogin(configuration).then(function(puserId){
				userId = puserId;
				return project.getPivotalProjects(userId);

			}).then(function(pprojects){
				deliver(userId, pprojects);

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
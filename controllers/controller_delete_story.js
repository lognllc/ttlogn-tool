var path = require('path'),
	fs = require('fs'),
	_ = require('underscore'),
	colog = require('colog'),
	story = require(path.resolve(__dirname,'../models/story.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	utils = require(path.resolve(__dirname,'../lib/utils.js')),
	config = require(path.resolve(__dirname,'../models/config.js')),
	project = require(path.resolve(__dirname,'../models/project.js'));

var controllerDeleteStories = {
	
	deleteStory: function(pfilter){
		var userId = '',
			storyProject = [],
			userInfo = {},
			configuration = config.getConfig();
		if(pfilter === '-a' || typeof pfilter === 'undefined'){
			if(config.existConfig){
				colog.log(colog.colorGreen('Loading...'));
				userInfo.email = configuration.email;
				userInfo.pivotalUser = configuration.pivotalUser;
				userInfo.password = configuration.pivotalPassword;

				user.pivotalLogin(userInfo).then(function(puserId){
					userId = puserId;
					return project.getPivotalProjects(userId);

				}).then(function(pprojects){
					utils.printNames(pprojects);
					return utils.getPromptProject2(pprojects);

				}).then(function(pproject){
					storyProject = pproject;
					return story.getStories(storyProject, userId, userInfo.pivotalUser, pfilter);

				}).then(function(){
					utils.printNames(storyProject.stories);
					return utils.getPromptStory(storyProject.stories);

				}).then(function(pstory){
					return story.deleteStory(storyProject.id, pstory.id, userId);

				}).then(function(){
					colog.log(colog.colorGreen("Story deleted"));

				}).catch(function(error) {
					colog.log(colog.colorRed(error));
				});
			}
			else{
				colog.log(colog.colorRed("Error: Configuration file doesn't exist"));
			}
		}
		else{
			colog.log(colog.colorRed("Error: list story [-a]"));
		}
	}
};

module.exports = controllerDeleteStories;


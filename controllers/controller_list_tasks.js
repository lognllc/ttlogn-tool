var path = require('path'),
	fs = require('fs'),
	_ = require('underscore'),
	colog = require('colog'),
	task = require(path.resolve(__dirname,'../models/task.js')),
	story = require(path.resolve(__dirname,'../models/story.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	utils = require(path.resolve(__dirname,'../lib/utils.js')),
	config = require(path.resolve(__dirname,'../models/config.js')),
	project = require(path.resolve(__dirname,'../models/project.js'));

var controllerListStories = {
	
	/*
	pfilter: filter to delete the story
	delete a story
	*/
	listTasks: function(pfilter){
		var RESTRICTION_PROJECT = 'Number of the project',
			RESTRICTION_STORY = 'Number of the story',
			DESCRIPTION = 'description',
			NAME_PROJECT = 'project_name',
			NAME = 'name';

		var storyProject = [],
			userInfo = {},
			configuration = config.getConfig();
		if(pfilter === '-a' || typeof pfilter === 'undefined'){
			if(config.existConfig){
				colog.log(colog.colorGreen('Loading...'));

				user.pivotalLogin(configuration).then(function(puser){
				userInfo = puser;
				utils.printArray(userInfo.projects, NAME_PROJECT);
				return utils.getPromptNumber(RESTRICTION_PROJECT, userInfo.projects);

				}).then(function(pproject){
					storyProject = pproject;
					return story.getProjectStories(storyProject, userInfo.api_token, userInfo.id, pfilter);

				}).then(function(){
					utils.printArray(storyProject.stories, NAME);
					return utils.getPromptNumber(RESTRICTION_STORY, storyProject.stories);

				}).then(function(pstory){
					selectedStory = pstory;
					return task.getTasks(storyProject.project_id, userInfo.api_token, pstory.id);

				}).then(function(ptasks){
					utils.printArray(ptasks, DESCRIPTION);

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

module.exports = controllerListStories;


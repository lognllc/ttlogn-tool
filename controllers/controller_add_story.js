var path = require('path'),
	fs = require('fs'),
	_ = require('underscore'),
	colog = require('colog'),
	story = require(path.resolve(__dirname,'../models/story.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	utils = require(path.resolve(__dirname,'../lib/utils.js')),
	config = require(path.resolve(__dirname,'../models/config.js')),
	project = require(path.resolve(__dirname,'../models/project.js'));

var NAME = 'name';

var printOptions = function(pproject, puserId, puser){
	var RESTRICTION_NAME = 'Name',
		RESTRICTION_DESCRIPTION = 'Description',
		RESTRICTION_TYPES = 'Select the numbre of the type',
		TYPES = [{name:'feature'}, {name:'chore'}, {name:'bug'}, {name:'release'}];

	var newStory = {};

	utils.getPromptText(RESTRICTION_NAME).then(function(promptResult){
		newStory.name = promptResult;
		return utils.getPromptText(RESTRICTION_DESCRIPTION);

	}).then(function(promptResult){
		newStory.description = promptResult;
		utils.printArray(TYPES, NAME);
		return utils.getPromptNumber(RESTRICTION_TYPES, TYPES);
	
	}).then(function(promptResult){
		newStory.story_type = promptResult.name;
		return story.addStory(pproject.project_id, puserId, newStory);

	}).then(function(){
		colog.log(colog.colorGreen('New story saved.'));

	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};

var controllerAddStory = {
	
	/*
	pfilter: filter to delete the story
	delete a story
	*/
	addStory: function(){
		var RESTRICTION = 'Number of the project',
			NAME_PROJECT = 'project_name';

		var userInfo = {},
			configuration = config.getConfig();
	
		if(config.existConfig){
			colog.log(colog.colorGreen('Loading...'));

			user.pivotalLogin(configuration).then(function(puser){
				userInfo = puser;
				utils.printArray(userInfo.projects, NAME_PROJECT);
				return utils.getPromptNumber(RESTRICTION, userInfo.projects);

			}).then(function(pproject){
				printOptions(pproject, userInfo.api_token, userInfo.name);

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
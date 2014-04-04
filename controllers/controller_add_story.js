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

	var newStory = {
			story:{
				requested_by: puser
			}
		};

	utils.getPromptText(RESTRICTION_NAME).then(function(promptResult){
		newStory.story.name = promptResult;
		return utils.getPromptText(RESTRICTION_DESCRIPTION);

	}).then(function(promptResult){
		newStory.story.description = promptResult;
		utils.printArray(TYPES, NAME);
		return utils.getPromptNumber(RESTRICTION_TYPES, TYPES);
	
	}).then(function(promptResult){
		newStory.story.story_type = promptResult.name;
		return story.addStory(pproject.id, puserId, newStory);

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
		var RESTRICTION = 'Number of the project';

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
				utils.printArray(pprojects, NAME);
				return utils.getPromptNumber(RESTRICTION, pprojects);

			}).then(function(pproject){
				storyProject.push(pproject);
				return project.getMemberships(userId, storyProject);

			}).then(function(pmemberships){
				pivotalUser = user.getPivotalUser(configuration.pivotalEmail, pmemberships);
				storyProject = _.first(storyProject);
				printOptions(storyProject, userId, pivotalUser);

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

/*
{
    name           : Name of this story
    story_type     : bug, feature, chore, release
    estimate (int) : number which indicates the level of difficulty of the story
    description    : description,
    labels         : Comma-separated list of labels
    requested_by   : Name of the requester
}
*/
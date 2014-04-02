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

var DESCRIPTION = 'description';

var printTasks = function(ptasks){
	_.each(pprojects, function(pivotalProject){
		console.log('-------------------------------');
		colog.log(colog.apply(pivotalProject.name, ['underline', 'bold', 'colorBlue']));
	});
};


var controllerListStories = {
	
	/*
	pfilter: filter to delete the story
	delete a story
	*/
	listTasks: function(pfilter){
		var userId = '',
			storyProject = [],
			pivotalUser = '',
			configuration = config.getConfig(),
			selectedStory = {};
		if(pfilter === '-a' || typeof pfilter === 'undefined'){
			if(config.existConfig){
				colog.log(colog.colorGreen('Loading...'));

				user.pivotalLogin(configuration).then(function(puserId){
					userId = puserId;
					return project.getPivotalProjects(userId);

				}).then(function(pprojects){
					utils.printNames(pprojects);
					return utils.getPromptProject(pprojects);

				}).then(function(pproject){
					storyProject.push(pproject);
					return project.getMemberships(userId, storyProject);

				}).then(function(pmemberships){
					pivotalUser = user.getPivotalUser(configuration.pivotalEmail, pmemberships);
					return story.getStories(storyProject, userId, pivotalUser, pfilter);

				}).then(function(){
					storyProject = _.first(storyProject);
					utils.printNames(storyProject.stories);
					return utils.getPromptStory(storyProject.stories);

				}).then(function(pstory){
					selectedStory = pstory;
					return task.getTasks(storyProject.id, userId, pstory.id);//story.deleteStory(storyProject.id, selectedStory.id, userId);

				}).then(function(ptasks){
//					console.log(ptasks);
					utils.printArray(ptasks, DESCRIPTION);
					//printTasks(ptasks);

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


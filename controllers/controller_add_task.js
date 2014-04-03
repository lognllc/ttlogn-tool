var path = require('path'),
	fs = require('fs'),
	_ = require('underscore'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	task = require(path.resolve(__dirname,'../models/task.js')),
	story = require(path.resolve(__dirname,'../models/story.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	utils = require(path.resolve(__dirname,'../lib/utils.js')),
	config = require(path.resolve(__dirname,'../models/config.js')),
	project = require(path.resolve(__dirname,'../models/project.js'));

var DESCRIPTION = 'description',
	NAME = 'name';

/*var getInfoTask = function(){
	var promise = new RSVP.Promise(function(resolve, reject){
			var self = this,
			newTask = {};

			resolve(newTask);

			reject(self);
		utils.printArray(ptasks, DESCRIPTION);
		return utils.getPromptStory(storyProject.stories);
	});
	return promise;
};

var useCommand = function(pcommand, storyProject, puserId, pstory){

storyProject = _.first(storyProject);
	if(pcommand !== 'add')
	{
		getInfoTask(add).then(function(ptask){
		task.addTask(pproject, ptasks);

		}).catch(function(error) {
			colog.log(colog.colorRed(error));
		});
	}
	else{
		getTask();
	}
};


var getTask = function(storyProject, puserId, pstory){
	var selectedStory = {};


//	return task.getTasks(storyProject.id, userId, pstory.id);

	utils.printArray(storyProject.stories, NAME);
	utils.getPromptStory(storyProject.stories).then(function(pstory){
		selectedStory = pstory;
		return task.getTasks(storyProject.id, userId, pstory.id);

	}).then(function(ptasks){
	utils.printArray(ptasks, DESCRIPTION);

	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};*/

var controllerAddTasks = {
	/*
	pfilter: filter to delete the story
	delete a story
	*/
	addTask: function(pfilter){
		var userId = '',
			storyProject = [],
			pivotalUser = '',
			configuration = config.getConfig(),
			selectedStory = {},
			newTask = {task: {}};

		if(pfilter === '-a' || typeof pfilter === 'undefined'){
			if(config.existConfig){
				colog.log(colog.colorGreen('Loading...'));

				user.pivotalLogin(configuration).then(function(puserId){
					userId = puserId;
					return project.getPivotalProjects(userId);

				}).then(function(pprojects){
					utils.printArray(pprojects, NAME);
					return utils.getPromptProject(pprojects);

				}).then(function(pproject){
					storyProject.push(pproject);
					return project.getMemberships(userId, storyProject);

				}).then(function(pmemberships){
					pivotalUser = user.getPivotalUser(configuration.pivotalEmail, pmemberships);
					return story.getStories(storyProject, userId, pivotalUser, pfilter);

				}).then(function(){
					storyProject = _.first(storyProject);
					utils.printArray(storyProject.stories, NAME);
					return utils.getPromptStory(storyProject.stories);

				}).then(function(pstory){
					selectedStory = pstory;
					return utils.getPromptDescription();
				//	useCommand(pcommand);
				}).then(function(description){
					newTask.task.description = description;
					task.addTask(storyProject, userId, selectedStory, newTask);

				}).then(function(description){
					colog.log(colog.colorGreen("Task saved"));

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

module.exports = controllerAddTasks;


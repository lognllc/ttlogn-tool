var path = require('path'),
	fs = require('fs'),
	_ = require('underscore'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	prompt = require('prompt'),
	task = require(path.resolve(__dirname,'../models/task.js')),
	story = require(path.resolve(__dirname,'../models/story.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	utils = require(path.resolve(__dirname,'../lib/utils.js')),
	config = require(path.resolve(__dirname,'../models/config.js')),
	project = require(path.resolve(__dirname,'../models/project.js'));

var DESCRIPTION = 'description',
	NAME = 'name',
	RESTRICTION_DESCRIPTION = 'Description';

/*pproject: project id of the user of pivotal
puserId: user id
pstory: story id
ptask: task to modify
modify the task description
*/
var modifyDescription = function(pproject, puserId, pstory, ptask){

	utils.getPromptText(RESTRICTION_DESCRIPTION).then(function(promptResult){
		ptask.description = promptResult;
		ptask.complete = (ptask.complete === 'true');
		return task.modifyTask(pproject, puserId, pstory, ptask);

	}).then(function(promptResult){
		colog.log(colog.colorGreen('Modified successfully'));
		
	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};

/*pproject: project id of the user of pivotal
puserId: user id
pstory: story id
ptask: task to modify
modify the task state
*/
var modifyState = function(pproject, puserId, pstory, ptask){
	var RESTRICTION_COMPLETE = 'Is completed';

	utils.getBoolPrompt(RESTRICTION_COMPLETE).then(function(promptResult){
		ptask.complete = promptResult;
		return task.modifyTask(pproject, puserId, pstory, ptask);

	}).then(function(promptResult){
		colog.log(colog.colorGreen('Modified successfully'));
		
	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};

/*
ptask: task to modify
prints the task, options
*/
var printOptions = function(ptask){
	colog.log(colog.colorMagenta('Select a field: '));
	colog.log(colog.colorBlue('1: Change state: ' + ptask.complete));
	colog.log(colog.colorBlue('2: Change name: ' + ptask.description));
	colog.log(colog.colorBlue('3: Cancel '));
};

/*pproject: project id of the user of pivotal
puserId: user id
pstory: story id
ptask: task to modify
prints the task and waits for an option
*/
var selectOption = function(pproject, puserId, pstory, ptask){
	var NUMBERS = /^\d+$/;

	printOptions(ptask);
	prompt.start();
	prompt.get({
		properties: {
			field: {
				description: "Number of field".magenta,
				required: true,
				default: '1',
				pattern: NUMBERS
			}
		}
	}, function (err, resultPrompt) {
		switch(resultPrompt.field){
			case '1':
				modifyState(pproject, puserId, pstory, ptask);
				break;
			case '2':
				modifyDescription(pproject, puserId, pstory, ptask);
				break;
			case '3':
				colog.log(colog.colorRed('Canceled'));
				process.exit(0);
			break;
			default:
				colog.log(colog.colorRed('Error: bad number'));
				selectOption(pproject, puserId, pstory, ptask);
		}
	});
};

/*pproject: project of the user of pivotal
puserId: user id
pstory: pstory
selects a task to display and modify
*/
var selectTask = function(pproject, puserId, pstory){
	var RESTRICTION_TASK = 'Number of the project';

	task.getTasks(pproject.project_id, puserId, pstory.id).then(function(ptasks){
		utils.printArray(ptasks, DESCRIPTION);
		return utils.getPromptNumber(RESTRICTION_TASK, ptasks);

	}).then(function(ptask){
		selectOption(pproject, puserId, pstory, ptask);

	}).catch(function(error) {
			colog.log(colog.colorRed(error));
	});

};


var controllerAddTasks = {
	/*
	pfilter: filter to delete the story
	modify a task
	*/
	modifyTask: function(pfilter){
		var RESTRICTION_PROJECT = 'Number of the project',
			RESTRICTION_STORY = 'Number of the story',
			NAME_PROJECT = 'project_name';

		var storyProject = {},
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
					selectTask(storyProject, userInfo.api_token, pstory);

				}).catch(function(error) {
					colog.log(colog.colorRed(error));
				});
			}
			else{
				colog.log(colog.colorRed("Error: Configuration file doesn't exist"));
			}
		}
		else{
			colog.log(colog.colorRed("Error: modify task [-a]"));
		}
	}
};

module.exports = controllerAddTasks;


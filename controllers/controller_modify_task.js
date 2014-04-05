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


/*prints the story, options
*/
var printOptions = function(){
	colog.log(colog.colorMagenta('Select a field: '));
	colog.log(colog.colorBlue('1: Change state: ' + selectedStory.current_state));
	colog.log(colog.colorBlue('2: Change name: ' + selectedStory.name));
	colog.log(colog.colorBlue('3: Cancel '));
};

/*prints the time entry and waits for an option
*/
var selectOption = function(pproject, puserId, pstory, ptask){
	var RESTRICTION_NAME = 'Name',
		RESTRICTION_COMPLETE = 'Completation',
		COMPLETE = 'complete',
		STATES = [{name:'true'}, {name:'false'}];

	printOptions();
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
				modifyState(STATES, RESTRICTION_STATE);
				break;
			case '2':
				modifyName(RESTRICTION_NAME, NAME);
				break;
			case '3':
				colog.log(colog.colorRed('Canceled'));
				process.exit(0);
			break;
			default:
				colog.log(colog.colorRed('Error: bad number'));
				printTimeEntry();
		}
	});
};


var controllerAddTasks = {
	/*
	pfilter: filter to delete the story
	delete a story
	*/
	modifyTask: function(pfilter){
		var RESTRICTION_PROJECT = 'Number of the project',
			RESTRICTION_STORY = 'Number of the story',
			RESTRICTION_DESCRIPTION = 'Description';

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
					return utils.getPromptNumber(RESTRICTION_PROJECT, pprojects);

				}).then(function(pproject){
					storyProject.push(pproject);
					return project.getMemberships(userId, storyProject);

				}).then(function(pmemberships){
					pivotalUser = user.getPivotalUser(configuration.pivotalEmail, pmemberships);
					return story.getStories(storyProject, userId, pivotalUser, pfilter);

				}).then(function(){
					storyProject = _.first(storyProject);
					utils.printArray(storyProject.stories, NAME);
					return utils.getPromptNumber(RESTRICTION_STORY, storyProject.stories);

				}).then(function(pstory){
					selectedStory = pstory;
					selectOption();
				//	return utils.getPromptText(RESTRICTION_DESCRIPTION);
				//	useCommand(pcommand);
				//}).then(function(description){
				//	newTask.task.description = description;
				//	return task.addTask(storyProject, userId, selectedStory, newTask);

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


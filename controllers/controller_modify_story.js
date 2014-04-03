var path = require('path'),
	fs = require('fs'),
	_ = require('underscore'),
	colog = require('colog'),
	prompt = require('prompt'),
	story = require(path.resolve(__dirname,'../models/story.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	utils = require(path.resolve(__dirname,'../lib/utils.js')),
	config = require(path.resolve(__dirname,'../models/config.js')),
	project = require(path.resolve(__dirname,'../models/project.js'));

var NAME = 'name',
	NUMBERS = /^\d+$/;

var projectId = 0,
	userId = 0,
	selectedStory = {};

/*prints the states, options
*/
var changeState = function(){
	states = [{name:'unstarted'}, {name:'started'}, {name:'finished'}, {name:'delivered'},
		{name:'rejected'}, {name:'accepted'}];
	utils.printArray(states, NAME);
	utils.getPromptState(states).then(function(state){
		selectedStory.current_state = state.name;
		selectOption();

	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};

/*prints the story, options
*/
var printOptions = function(){
//	console.log(entryToModify);
//	var date = entryToModify.created.format(DATE_FORMAT);

	colog.log(colog.colorMagenta('Select a field: '));
	colog.log(colog.colorBlue('1: Change state: ' + selectedStory.current_state));
	colog.log(colog.colorBlue('2: Change name: ' + selectedStory.name));
	colog.log(colog.colorBlue('3: Change description: ' + selectedStory.description));
	colog.log(colog.colorBlue('4: Change estimation: ' + selectedStory.estimate));
	colog.log(colog.colorBlue('5: Save '));
	colog.log(colog.colorBlue('6: Cancel '));
};

/*prints the time entry and waits for an option
*/
var selectOption = function(){
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
				changeState();
				break;
			case '2':
				modifyName();
				break;
			case '3':
				modifyDescription();
				break;
			case '4':
				getHourType();
				break;
			case '5':
				saveStory();
				break;
			case '6':
				colog.log(colog.colorRed('Canceled'));
				process.exit(0);
			break;
			default:
				colog.log(colog.colorRed('Error: bad number'));
				printTimeEntry();
		}
	});
};


var controllerModifyStory = {
	
	/*
	pfilter: filter to delete the story
	delete a story
	*/
	modifyStory: function(pfilter){
		var //userId = '',
			storyProject = [],
			pivotalUser = '',
			configuration = config.getConfig();
			//selectedStory = {};
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
					projectId = storyProject.id;
					selectOption();

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

module.exports = controllerModifyStory;

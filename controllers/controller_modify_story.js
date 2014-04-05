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

var storyProject = [],
	userId = 0,
	estimations = [],
	selectedStory = {};

/* get the new name
*/
var getEstimations = function(){
	var estimationsArray = storyProject.point_scale.split(',');
	_.each(estimationsArray, function(value){
		estimations.push({name: value});
	});
};

/* get the new name
*/
var updateStory = function(){
	var newStory = {};

	newStory.name = selectedStory.name;
	newStory.description = selectedStory.description;
	newStory.estimate = parseInt(selectedStory.estimate);
	newStory.current_state = selectedStory.current_state;

	story.modifyStory(storyProject.id, userId, newStory, selectedStory.id).then(function(promptResult){
		colog.log(colog.colorGreen('Story updated.'));
	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};

/* get the new name
*/
var modifyText = function(prestriction, patribute){

	utils.getPromptText(prestriction).then(function(promptResult){
		selectedStory[patribute] = promptResult;
		selectOption();
		
	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};

/*prints the states, options
*/
var modifyAtribute = function(parray, prestriction, patribute){

	utils.printArray(parray, NAME);
	utils.getPromptNumber(prestriction, parray).then(function(item){
		selectedStory[patribute] = item.name;
		selectOption();

	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};

/*prints the story, options
*/
var printOptions = function(){
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
	var RESTRICTION_NAME = 'Name',
		RESTRICTION_DESCRIPTION = 'Description',
		DESCRIPTION = 'description',
		ESTIMATE = 'estimate',
		RESTRICTION_ESTIMATE = 'Select estimate',
		STATE = 'current_state',
		STATES = [{name:'unstarted'}, {name:'started'}, {name:'finished'}, {name:'delivered'},
			{name:'rejected'}, {name:'accepted'}],
		RESTRICTION_STATE = 'Number of state';

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
				modifyAtribute(STATES, RESTRICTION_STATE, STATE);
				break;
			case '2':
				modifyText(RESTRICTION_NAME, NAME);
				break;
			case '3':
				modifyText(RESTRICTION_DESCRIPTION, DESCRIPTION);
				break;
			case '4':

				modifyAtribute(estimations, RESTRICTION_ESTIMATE, ESTIMATE);
				break;
			case '5':
				updateStory();
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
		var RESTRICTION = 'Number of the project',
			RESTRICTION_STORY = 'Number of the story';

		var pivotalUser = '',
			configuration = config.getConfig();
		if(pfilter === '-a' || typeof pfilter === 'undefined'){
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
					return story.getStories(storyProject, userId, pivotalUser, pfilter);

				}).then(function(){
					storyProject = _.first(storyProject);
					utils.printArray(storyProject.stories, NAME);
					return utils.getPromptNumber(RESTRICTION_STORY, storyProject.stories);

				}).then(function(pstory){
					selectedStory = pstory;
					getEstimations();
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

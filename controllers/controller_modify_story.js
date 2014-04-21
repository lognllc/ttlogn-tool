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
	NAME_PROJECT = 'project_name',
	DESCRIPTION = 'description',
	ESTIMATE = 'estimate',
	STATE = 'current_state',
	OWNER = 'owner_ids',
	NUMBERS = /^\d+$/;

var storyProject = {},
	userInfo = {},
	estimations = [],
	selectedStory = {};


/* updates the story
*/
var updateStory = function(){
	var newStory = _.pick(selectedStory, NAME, DESCRIPTION, ESTIMATE, STATE, OWNER);

	newStory.estimate = parseInt(newStory.estimate, 10);
	story.modifyStory(storyProject.project_id, userInfo.api_token, newStory, selectedStory.id).then(
		function(promptResult){
		
		colog.log(colog.colorGreen('Story updated.'));
	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};

/* prestriccion: description of the prompt
patribute: atrbute to modify
modify a text atribute
*/

var modifyText = function(prestriction, patribute){

	utils.getPromptText(prestriction).then(function(promptResult){
		selectedStory[patribute] = promptResult;
		selectOption();
		
	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};

/* parray: array to display
prestriccion: description of the prompt
patribute: atrbute to modify
modify a atribute
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

/* 
push the user id to owners ids
*/
var modifyOwner = function(){
	if(_.contains(selectedStory[OWNER], userInfo.id)){
		colog.log(colog.colorGreen('You are already an owner'));
	}
	else{
		selectedStory[OWNER].push(userInfo.id);
	}
	selectOption();
};

/*prints the entry, options
*/
var printOptions = function(){
	colog.log(colog.colorMagenta('Select a field: '));
	colog.log(colog.colorBlue('1: Change state: ' + selectedStory.current_state));
	colog.log(colog.colorBlue('2: Change name: ' + selectedStory.name));
	colog.log(colog.colorBlue('3: Change description: ' + selectedStory.description));
	colog.log(colog.colorBlue('4: Change estimation: ' + selectedStory.estimate));
	colog.log(colog.colorBlue('5: Change owner: ' + _.contains(selectedStory.owner_ids, userInfo.id)));
	colog.log(colog.colorBlue('6: Save '));
	colog.log(colog.colorBlue('7: Cancel '));
};

/*prints the story and waits for an option
*/
// must get the states
var selectOption = function(){
	var RESTRICTION_NAME = 'Name',
		RESTRICTION_DESCRIPTION = 'Description',
		RESTRICTION_ESTIMATE = 'Select estimate',
		STATES = [{name:'unscheduled'},{name:'unstarted'}, {name:'started'}, {name:'finished'},
			{name:'delivered'}, {name:'rejected'}, {name:'accepted'}],
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
				modifyOwner();
				break;
			case '6':
				updateStory();
				break;
			case '7':
				colog.log(colog.colorRed('Canceled'));
				process.exit(0);
			break;
			default:
				colog.log(colog.colorRed('Error: bad number'));
				printTimeEntry();
		}
	});
};

/* get the estimations of the project
*/
var getEstimations = function(){
	var estimationsArray = '';

	project.getPivotalProject(userInfo.api_token, storyProject.project_id).then(
		function(pproject){

		estimationsArray = pproject.point_scale.split(',');
		_.each(estimationsArray, function(value){
			estimations.push({name: value});
		});
		selectOption();

	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};

var controllerModifyStory = {
	
	/*
	pfilter: filter to delete the story
	modify a story
	*/
	modifyStory: function(pfilter){
		var RESTRICTION_PROJECT = 'Number of the project',
			RESTRICTION_STORY = 'Number of the story';

		var configuration = config.getConfig();
		
		if(pfilter === '-a' || pfilter === '-r' || typeof pfilter === 'undefined'){
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
					getEstimations();

				}).catch(function(error) {
					colog.log(colog.colorRed(error));
				});
			}
			else{
				colog.log(colog.colorRed("Error: Configuration file doesn't exist"));
			}
		}
		else{
			colog.log(colog.colorRed("Error: modify story [-a|-r]"));
		}
	}
};

module.exports = controllerModifyStory;

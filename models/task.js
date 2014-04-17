var path = require('path'),
	RSVP = require('rsvp'),
	_ = require('underscore'),
	colog = require('colog'),
	pivotal = require('pivotal'),
	fs = require('fs'),
	dataAccess = require(path.resolve(__dirname,'../dataAccess/pivotal_data_access.js'));

var UNFINISH = false,
	PROJECT = 'projects/',
	STORIES = '/stories/' ,
	TASKS = '/tasks/';

var task = {
	
	/* pprojectId: id of the project
	puser: token of the user
	pstoryId: id of the story
	get the tasks of a story of an user 
	*/
	getTasks: function(pprojectId, puser, pstoryId){
		var url = PROJECT + pprojectId + STORIES + pstoryId + TASKS;
		return dataAccess.get(puser, url);
	},

	/* pprojects: project of the user
	puser: token of the user
	pstory: story of the project and the user
	ptask: new task
	add a new story to the TT 
	*/
	addTask: function(pproject, puser, pstory, ptask){
		var url = PROJECT + pproject.project_id + STORIES + pstory.id + TASKS;
		ptask.complete = UNFINISH;
		return dataAccess.post(puser, url, ptask);
	},

	/* pprojects: project of the user
	puser: token of the user
	pstory: story of the project and the user story
	ptask: modified task
	modify a task in pivotal 
	*/
	modifyTask: function(pproject, puser, pstory, ptask){
		var newTask = _.pick(ptask, 'description', 'complete'),
			url = PROJECT + pproject.project_id + STORIES + pstory.id + TASKS + ptask.id;
		ptask.complete = newTask;
		return dataAccess.put(puser, url, newTask);
	}

};

module.exports = task;
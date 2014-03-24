var path = require('path'),
	fs = require('fs'),
	_ = require('underscore'),
	colog = require('colog'),
	story = require(path.resolve(__dirname,'../models/story.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	config = require(path.resolve(__dirname,'../models/config.js')),
	project = require(path.resolve(__dirname,'../models/project.js'));


var printStories = function(pprojects){
	//console.log(pprojects.project);
	_.each(pprojects, function(pivotalProject){
		console.log('');
		colog.log(colog.apply(pivotalProject.name, ['underline', 'bold', 'colorBlue']));
		console.log('-------------------------------');
		console.log('-------------------------------');
		_.each(pivotalProject.stories, function(pivotalStory){
			colog.log(colog.apply(pivotalStory.name + ' - ' + pivotalStory.story_type, ['bold', 'colorBlue']));
			colog.log(colog.colorBlue(pivotalStory.description));
			console.log('-------------------------------');
		});
	});
};

var controllerListStories = {
	// returns the limit date
	listStories: function(pfilter){
		var userId = '',
			projects = [],
			userInfo = {},
			pivotalUser = '',
			configuration = config.getConfig();
		if(pfilter === '-a' || typeof pfilter === 'undefined'){
			if(config.existConfig){
				colog.log(colog.colorGreen('Loading...'));
				userInfo.email = configuration.email;
				userInfo.pivotalUser = configuration.pivotalUser;
				userInfo.password = configuration.pivotalPassword;

				user.pivotalLogin(userInfo).then(function(puserId){
					userId = puserId;
					return project.getPivotalProjects(userId);

				}).then(function(pprojects){
					projects = pprojects;
					return project.getMemberships(userId, projects);

				}).then(function(pmemberships){
					pivotalUser = user.getPivotalUser(userInfo, pmemberships);
					return story.getStories(projects, userId, pivotalUser, pfilter);

				}).then(function(){
					printStories(projects);

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


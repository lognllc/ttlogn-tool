var path = require('path'),
	fs = require('fs'),
	story = require(path.resolve(__dirname,'../models/story.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	project = require(path.resolve(__dirname,'../models/project.js'));


var controllerListStories = {
	// returns the limit date
	getPivotalProjects: function(){
		var userId = '',
			projects = [],
			userInfo = {
				email: 'danielsolis.logn@gmail.com',
				password: ''
			};

		//	story.getPivotalProjects(userInfo);
		user.pivotalLogin(userInfo).then(function(puserId){
			userId = puserId;
			//console.log(userId);
			return project.getPivotalProjects(userId);

		}).then(function(pprojects){
			//console.log(pprojects);
			projects = pprojects;
			return story.getStory(projects.project.id);

		}).then(function(pstories){
			console.log(pstories);

		}).catch(function(error) {
			colog.log(colog.colorRed(error));
		});
	}
};

module.exports = controllerListStories;


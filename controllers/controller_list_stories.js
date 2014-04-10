var path = require('path'),
	fs = require('fs'),
	_ = require('underscore'),
	colog = require('colog'),
	story = require(path.resolve(__dirname,'../models/story.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	config = require(path.resolve(__dirname,'../models/config.js')),
	project = require(path.resolve(__dirname,'../models/project.js'));

/*
pprojects: projects to print
print the list the stories of the projects
*/
var printStories = function(pprojects){
	//console.log(pprojects.project);
	_.each(pprojects, function(pivotalProject){
		console.log('');
		colog.log(colog.apply(pivotalProject.project_name, ['underline', 'bold', 'colorBlue']));
		console.log('-------------------------------');
		console.log('-------------------------------');
		_.each(pivotalProject.stories, function(pivotalStory){
			colog.log(colog.apply(pivotalStory.name + ' - ' + pivotalStory.story_type, ['bold', 'colorBlue']));
			if(!_.isUndefined(pivotalStory.description)){
				colog.log(colog.colorBlue(pivotalStory.description));
			}
			console.log('-------------------------------');
		});
	});
};

var controllerListStories = {
	
	/*
	pfilter: filter of the list of stories
	list the stories of an user
	*/
	listStories: function(pfilter){
		var configuration = config.getConfig(),
			userInfo = {};

		if(pfilter === '-a' || typeof pfilter === 'undefined'){
			if(config.existConfig){
				colog.log(colog.colorGreen('Loading...'));

				user.pivotalLogin(configuration).then(function(puser){
				userInfo = puser;
				return story.getStories(userInfo.projects, userInfo.api_token, userInfo.id, pfilter);

				}).then(function(){
					printStories(userInfo.projects);

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


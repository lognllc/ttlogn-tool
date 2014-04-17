var path = require('path'),
	fs = require('fs'),
	_ = require('underscore'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	story = require(path.resolve(__dirname,'../models/story.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	utils = require(path.resolve(__dirname,'../lib/utils.js')),
	config = require(path.resolve(__dirname,'../models/config.js')),
	project = require(path.resolve(__dirname,'../models/project.js')),
	dataAccess = require(path.resolve(__dirname,'../dataAccess/pivotal_data_access.js'));

var FINISHED = 'delivered',
	STATE = { current_state: FINISHED };

/* puserId: user token
purls: urls used to deliver stories
deliver all stories
*/
var	deliver = function(puserId, purls){
	var newStory = _.first(purls);
		newUrls = _.rest(purls);

	story.modifyStory(newStory.project, puserId, STATE, newStory.story).then(function(){
		if(!_.isEmpty(newUrls)){
			deliver(puserId, newUrls);
		}
		else{
			colog.log(colog.colorGreen('Stories delivered successfully'));
		}

	}).catch(function(error) {
		colog.log(colog.colorRed(error));
	});
};

/* puserId: user token
pprojects: projects of pivotal
set all the urls to deliver all stories
*/
var	getStories = function(puserId, pprojects){
	var urls = [];

	_.each(pprojects, function(item){
		_.each(item.stories, function(value){
			var newStory = {
				project: item.project_id,
				story: value.id
			};
			colog.log(colog.colorBlue('Delivering: ' + value.name));
			urls.push(newStory);
		});
	});
	deliver(puserId, urls);
};

var controllerAddStory = {
	
	/*
	deliver all the stories
	*/
	deliverStories: function(){
		var FILTER = '-f';

		var configuration = config.getConfig(),
			newStory = {},
			userInfo = {};
	
		if(config.existConfig){
			colog.log(colog.colorGreen('Loading...'));

			user.pivotalLogin(configuration).then(function(puser){
				userInfo = puser;
				return story.getStories(userInfo.projects, userInfo.api_token, userInfo.id, FILTER);

			}).then(function(){
				getStories(userInfo.api_token, userInfo.projects);

			}).catch(function(error) {
				colog.log(colog.colorRed(error));
			});
		}
		else{
			colog.log(colog.colorRed("Error: Configuration file doesn't exist"));
		}
	}
};

module.exports = controllerAddStory;
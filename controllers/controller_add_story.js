var path = require('path'),
	fs = require('fs'),
	_ = require('underscore'),
	colog = require('colog'),
	story = require(path.resolve(__dirname,'../models/story.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	utils = require(path.resolve(__dirname,'../lib/utils.js')),
	config = require(path.resolve(__dirname,'../models/config.js')),
	project = require(path.resolve(__dirname,'../models/project.js'));

var controllerAddStory = {
	
	/*
	pfilter: filter to delete the story
	delete a story
	*/
	addStory: function(){
		var userId = '',
			storyProject = [],
			pivotalUser = '',
			configuration = config.getConfig(),
			newStory = {};
	
		if(config.existConfig){
			colog.log(colog.colorGreen('Loading...'));

			user.pivotalLogin(configuration).then(function(puserId){
				userId = puserId;
				return project.getPivotalProjects(userId);

			}).then(function(pprojects){
				utils.printNames(pprojects);
				return utils.getPromptProject(pprojects);

			}).then(function(pproject){
				storyProject.push(pproject);
				return project.getMemberships(userId, storyProject);

			}).then(function(pmemberships){
				pivotalUser = user.getPivotalUser(configuration.pivotalEmail, pmemberships);
				storyProject = _.first(storyProject);

					//utils.printNames(storyProject.stories);
					//return utils.getPromptProject(storyProject.stories);

//				}).then(function(){
					
				newStory = {
				//	project_id: storyProject.id,
					name: 'add test',
					story_type: 'feature',
					estimate: '1',
					description: 'test description',
					labels: '',
					requested_by: pivotalUser
				};

				return story.addStory(storyProject, userId, newStory);
/*
			}).then(function(){
					return ;
*/
			}).then(function(){
				colog.log(colog.colorGreen('New story saved.'));

			}).catch(function(error) {
				colog.log(colog.colorRed(error));
			});
		}
		else{
			colog.log(colog.colorRed("Error: Configuration file doesn't exist"));
		}
	}
};
/*
{
    name           : Name of this story
    story_type     : bug, feature, chore, release
    estimate (int) : number which indicates the level of difficulty of the story
    description    : description,
    labels         : Comma-separated list of labels
    requested_by   : Name of the requester
}
*/
module.exports = controllerAddStory;
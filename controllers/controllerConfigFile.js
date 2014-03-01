var path = require('path'),
	colog = require('colog'),
	prompt = require('prompt'),
	_ = require('underscore'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	project = require(path.resolve(__dirname,'../models/project.js'));



var saveRepo = function(pdata){
	
	colog.log(colog.colorBlue('Select a project: '));
	_.each(pdata.result, function(projects, index){
		colog.log(colog.colorBlue(index + ': ' + projects.name));
	});

	prompt.start();

	prompt.get(['project'], function (err, resultPrompt) {
		config.registerRepo(pdata.result[resultPrompt.project]);
	});
};

var getUserProject = function(pdata){
	project.getProjects(pdata.result.id, saveRepo);
};


var controllerConfigFile = {
	/* 
	register a user in the configuration file
	puser: the information of the user
	*/
	registerUser: function(puser){
		config.registerUser(puser);
	},

	/* 
	register a repo in the configuration file
	*/
	registerRepo: function(){
		var configuration = {};

		if(config.existConfig()){
			configuration = config.getConfig();
			user.login(configuration.email, configuration.password, getUserProject);
		}
		else{
			colog.log(colog.colorRed('Error: Make first the configuration:'));
			colog.log(colog.colorRed('ttlogn login email password git_name'));
		}
	}

};

module.exports = controllerConfigFile;
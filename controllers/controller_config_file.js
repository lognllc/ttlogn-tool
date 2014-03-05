var path = require('path'),
	colog = require('colog'),
	prompt = require('prompt'),
	_ = require('underscore'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	project = require(path.resolve(__dirname,'../models/project.js'));

/*pprojects: projects of the user to display
waits the user to choose a project, then save the repository*/
var saveRepo = function(pprojects){
	colog.log(colog.colorBlue('Select a project: '));
	_.each(pprojects.result, function(projects, index){
		colog.log(colog.colorBlue(index + ': ' + projects.name));
	});

	prompt.start();

	prompt.get({
		properties: {
			project: {
				description: "Number of the project: ".magenta,
				required: true
			}
		}
	}, function (err, resultPrompt) {
		if(err){
			colog.log(colog.colorRed(err));
		}
		config.registerRepo(pproyects.result[resultPrompt.project]);
	});
};

/*puser: object puser 
uses the id of the user to search for he's projects */
var getUserProject = function(puser){
	project.getProjects(puser.result.id, saveRepo);
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
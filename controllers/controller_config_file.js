var path = require('path'),
	colog = require('colog'),
	prompt = require('prompt'),
	_ = require('underscore'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	commit = require(path.resolve(__dirname,'../models/commit.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	utils = require(path.resolve(__dirname,'../lib/utils.js')),
	project = require(path.resolve(__dirname,'../models/project.js'));

var INTEGER = /^\d+$/,
	NAME = 'name';

/*
pbranches: branches to select and bind
pproject: project to save
waits the user to choose a project, then save the repository
*/
var saveRepo = function(pbranches, pproject, prepoName){
	newBranch = {};

	colog.log(colog.colorMagenta('Select a branch: '));
	_.each(pbranches, function(branch, index){
		index++;
		colog.log(colog.colorMagenta(index + ': ' + branch.name));
	});
	all = pbranches.length + 1;
	colog.log(colog.colorMagenta(all + ': All'));

	prompt.start();

	prompt.get({
		properties: {
			branch: {
				description: "Number of the branch ".magenta,
				required: true,
				pattern: INTEGER
			}
		}
	}, function (err, resultPrompt) {
		if(err){
			colog.log(colog.colorRed(err));
		}
		else{
			if(resultPrompt.branch <= pbranches.length){
				newBranch = pbranches[resultPrompt.branch - 1];
			}
			config.registerRepo(pproject, newBranch.name, prepoName);
		}
	});
};

/*
pprojects: projects of the user to display
waits the user to choose a project, then save the repository
*/
var getProject = function(pprojects){
	var RESTRICTION = 'Number of the project';

	var repoPath = process.cwd(), //'/mnt/hgfs/Development/repoPrueba',
		newProject = {},
		branches = [],
		repos = [],
		repo = [{path: repoPath}];

	utils.getPromptNumber(RESTRICTION, pprojects).then(function(pproject){
		newProject = pproject;
		return commit.getRepoBranches(repoPath);

	}).then(function(pbranches){
		branches = pbranches;
		return commit.getReposConfig(repo, repos);

	}).then(function(){
		repos = _.first(repos);
		saveRepo(branches, newProject, repos.name);
	});
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
	pbranch: branch to bind
	register a repo in the configuration file
	*/
	registerRepo: function(pbranch){
		var configuration = {},
			userInfo = {};
		
		if(config.existConfig()){
			configuration = config.getConfig();
			user.login(configuration.email, configuration.password).then(function(puser){
				userInfo = {
					token: puser.result.token,
					email: configuration.email
				};
				return project.getProjects(puser.result.user.id, userInfo);

			}).then(function(pprojects) {
				utils.printArray(pprojects.result, NAME);
				getProject(pprojects.result);

			}).catch(function(error) {
				colog.log(colog.colorRed(error));
			});
		}
		else{
			colog.log(colog.colorRed('Error: Make first the configuration:'));
			colog.log(colog.colorRed('ttlogn login'));
		}
	},


	/* 
	delete the configuration file.
	*/
	deleteConfig: function(){
		var message = 'the information you have supplied';

		colog.log(colog.colorRed('This will erase and reset all of the information you have supplied to the app.'));
		utils.getConfirmation(message).then(function() {
			config.deleteConfig();
			colog.log(colog.colorGreen("Information was deleted, you've logged out succesfully."));
		}).catch(function(error) {
			colog.log(colog.colorRed(error));
		});
	},


	/* 
	delete a repo in the configuration file
	*/
	deleteRepo: function(){
		var configuration = {},
		newRepos = [],
		restriction = {
			description: "Number of the repository".magenta,
			required: true,
			pattern: INTEGER
		};
		
		if(config.existConfig()){
			configuration = config.getConfig();

			utils.printArray(configuration.repositories, NAME);
			utils.getNumberPrompt(restriction, configuration.repositories).then(function(prepo){
				deletePath = path.basename(prepo.name);
				newRepos = config.deleteRepo(configuration.repositories, prepo);
				return utils.getConfirmation(deletePath);

			}).then(function(){
				config.saveRepos(configuration, newRepos);

			}).catch(function(error) {
				colog.log(colog.colorRed(error));
			});
		}
		else{
			colog.log(colog.colorRed('Error: Make first the configuration:'));
		}
	}
};

module.exports = controllerConfigFile;
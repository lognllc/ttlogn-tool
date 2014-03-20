var path = require('path'),
	colog = require('colog'),
	prompt = require('prompt'),
	_ = require('underscore'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	commit = require(path.resolve(__dirname,'../models/commit.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	utils = require(path.resolve(__dirname,'../lib/utils.js')),
	project = require(path.resolve(__dirname,'../models/project.js'));

var printRepos = function(pconfig){
	var newRepos = [];

	_.each(pconfig.repositories, function(repos, index){
		index++;
		repoPath = path.basename(repos.path);
		colog.log(colog.colorBlue(index + ': ' + repoPath));
	});

	prompt.start();

	prompt.get({
		properties: {
			repo: {
				description: "Number of the repository: ".magenta,
				required: true
			}
		}
	}, function (err, resultPrompt) {
		if(err){
			colog.log(colog.colorRed(err));
		}

		deletePath = path.basename(pconfig.repositories[resultPrompt.repo - 1]);
		colog.log(colog.colorBlue('Deleting: ' + deletePath));
		newRepos = config.deleteRepo(pconfig.repositories, pconfig.repositories[resultPrompt.repo - 1]);
		config.saveRepos(pconfig, newRepos);
	});

};


/*pprojects: projects of the user to display
waits the user to choose a project, then save the repository*/
var saveRepo = function(pbranches, pproject){
	newBranch = {};

	colog.log(colog.colorBlue('Select a branch: '));
	_.each(pbranches, function(branch, index){
		index++;
		colog.log(colog.colorBlue(index + ': ' + branch.name));
	});
	all = pbranches.length + 1;
	colog.log(colog.colorBlue(all + ': All'));

	prompt.start();

	prompt.get({
		properties: {
			branch: {
				description: "Number of the branch: ".magenta,
				required: true
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
			config.registerRepo(pproject, newBranch.name);
		}
	});
};

/*pprojects: projects of the user to display
waits the user to choose a project, then save the repository*/
var getProject = function(pprojects){
	var repoPath = process.cwd(), //'/mnt/hgfs/Development/repoPrueba', //process.cwd(),
		cancel = 0,
		newProject = {};

	cancel = pprojects.length + 1;
	colog.log(colog.colorBlue(cancel + ': Cancel'));

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
		newProject =  pprojects[resultPrompt.project - 1];
		commit.getRepoBranches(repoPath).then(function(pbranches){
			saveRepo(pbranches, newProject);
		}).catch(function(error) {
			colog.log(colog.colorRed(error));
		});
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
	register a repo in the configuration file
	*/
	registerRepo: function(pbranch){
		var configuration = {};
		
		if(config.existConfig()){
			configuration = config.getConfig();
			user.login(configuration.email, configuration.password).then(function(puser){
				return project.getProjects(puser.result.id);

			}).then(function(pprojects) {
				utils.printNames(pprojects.result);
				getProject(pprojects.result);

			}).catch(function(error) {
				colog.log(colog.colorRed(error));
			});
		}
		else{
			colog.log(colog.colorRed('Error: Make first the configuration:'));
			colog.log(colog.colorRed('ttlogn login email password git_name pivotal_password'));
		}
	},

	/* 
	register a repo in the configuration file
	*/
	deleteRepo: function(pbranch){
		var configuration = {};
		
		if(config.existConfig()){
			configuration = config.getConfig();
			printRepos(configuration);
		}
		else{
			colog.log(colog.colorRed('Error: Make first the configuration:'));
		}
	}
};

module.exports = controllerConfigFile;
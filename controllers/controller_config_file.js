var path = require('path'),
	colog = require('colog'),
	prompt = require('prompt'),
	_ = require('underscore'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	commit = require(path.resolve(__dirname,'../models/commit.js')),
	user = require(path.resolve(__dirname,'../models/user.js')),
	project = require(path.resolve(__dirname,'../models/project.js'));

var branchName = '',
	newProject = {};


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
var saveRepo = function(pbranches){
	branch = {};

	colog.log(colog.colorBlue('Select a branch: '));
	_.each(pbranches, function(branch, index){
		index++;
		colog.log(colog.colorBlue(index + ': ' + branch.name));
	});
	cancel = pbranches.length + 1;
	colog.log(colog.colorBlue(cancel + ': All'));

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
				branch = pbranches[resultPrompt.branch - 1];
			}
			config.registerRepo(newProject, branch.name);
		}
	});
};


/*puser: object puser 
uses the id of the user to search for he's projects */
/*var getRepos = function(puser){
	project.getProjects(puser.result.id, saveRepo);
};*/


/*pprojects: projects of the user to display
waits the user to choose a project, then save the repository*/
var getProject = function(pprojects){
	var repoPath = process.cwd(),
		cancel = 0;

	colog.log(colog.colorBlue('Select a project: '));
	_.each(pprojects.result, function(projects, index){
		index++;
		colog.log(colog.colorBlue(index + ': ' + projects.name));
	});
	cancel = pprojects.result.length + 1;
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
		newProject =  pprojects.result[resultPrompt.project - 1];

//		config.registerRepo(pprojects.result[resultPrompt.project - 1]);
		
		console.log(repoPath);
		commit.getRepoBranches('/mnt/hgfs/Development/ttlogn-tool', saveRepo);
	});
};

/*puser: object puser 
uses the id of the user to search for he's projects */
var getUserProject = function(puser){
	project.getProjects(puser.result.id, getProject);
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
			user.login(configuration.email, configuration.password, getUserProject);
		}
		else{
			colog.log(colog.colorRed('Error: Make first the configuration:'));
			colog.log(colog.colorRed('ttlogn login email password git_name'));
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


//{"path":"/mnt/hgfs/Development/ttlogn-tool","project":{"name":"Cisco POC","id":75}}
module.exports = controllerConfigFile;
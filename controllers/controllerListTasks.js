var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	commit = require(path.resolve(__dirname,'../models/commit.js'));

var FORMATHOUR = /[^(]+\(\d+h\)/g,
	DIGITOS = /\d+/g;

var gitName = '';

/* pparameter: array of the repositories and branches
get the commits
*/
var getCommits = function(pparameter){
	commit.getBranchCommits(pparameter, printCommits);
};

/* pparameter: array of the repositories
get the branches
*/
var getBranches = function(pparameter){
	commit.getBranches(pparameter, getCommits);
};


/* ppath: repository path
parray: array of commits
prints the information of the commits 
if the last commit has a high date than the limitDate
*/
var	printCommits = function(parray){
	var date = new Date(),
	message = '',
	limitDate = new Date();

	limitDate = commit.getDateLimit();

	_.each(parray, function(repository){
		colog.log(colog.apply('\n' + repository.name + '\n', ['underline', 'bold']));
		_.each(repository.branches, function(branch){
			_.each(branch.commits, function(value){
				if(value.author.name === gitName && value.committed_date >= limitDate && FORMATHOUR.test(value.message)){
					message = value.message.split('\n');
					message = message[0];
					colog.log(colog.apply('Proyecto: ' + branch.name, ['underline', 'blue']));
					colog.log(colog.colorBlue(message));
					colog.log(colog.colorBlue(value.committed_date + '\n'));
					console.log('---------------------------------------- \n');
				}
			});
		});
	});
};


var controllerListTasks = {

	/* 
	list the commits the tasks realized by an user
	pdate: maximum date d/w/m
	*/

	listTasks: function(pdate){
		var repos = [],
			user = [];

		if(pdate === '-w' || pdate === '-m' || pdate === '-d' || typeof pdate === 'undefined'){

			if(config.existConfig){

				commit.setDateLimit(pdate);
				
				user = config.getConfigUser();
				gitName = user.gitUser;
				repos = config.getConfigRepos();

				colog.log(colog.colorGreen('Loading...'));
				commit.getRepoName(repos, getBranches);
			}
			else{
				colog.log(colog.colorRed("Error: Configuration file doesn't exist"));
			}
		}
		else{
			colog.log(colog.colorRed('Error: ttlogn ls [-d/-w/-m]'));
		}
	}

};

module.exports = controllerListTasks;

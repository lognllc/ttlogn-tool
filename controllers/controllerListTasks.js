var _ = require('underscore'),
	path = require('path'),
	colog = require('colog'),
	RSVP = require('rsvp'),
	moment = require('moment'),
	config = require(path.resolve(__dirname,'../models/config.js')),
	commit = require(path.resolve(__dirname,'../models/commit.js'));

var FORMATHOUR = /[^(]+\(\d+h\)/g,
	DIGITOS = /\d+/g;

var gitName = '';

/* pprepos: array of the repositories and branches
get the commits
*/
var getCommits = function(prepos){
	commit.getBranchCommits(prepos, printCommits);
};

/* pconfig: array of the repositories
get the branches
*/
var getBranches = function(pconfig){
	commit.getBranches(pconfig, getCommits);
};


/* parray: array of commits
prints the information of the commits 
if the last commit has a high date than the limitDate
*/
var	printCommits = function(parray){
	var date = new Date(),
	message = '',
	limitDate = new Date();

	limitDate = commit.getDateLimit();

	_.each(parray, function(repository){
		_.each(repository.branches, function(branch){
			colog.log(colog.apply('Proyecto: ' + repository.project, ['underline', 'blue', 'bold']));
			_.each(branch.commits, function(value){
				if(value.author.name === gitName && value.committed_date >= limitDate && FORMATHOUR.test(value.message)){
					message = value.message.split('\n');
					message = message[0];
					date = moment(value.committed_date).format('MM-DD-YYYY');
					colog.log(colog.colorBlue(message + ' Date: ' + date ));
				//	colog.log(colog.colorBlue(value.committed_date + date +'\n'));
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
				
				configuration = config.getConfig();
				gitName = configuration.gitUser;
				repos = configuration.repositories;

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
